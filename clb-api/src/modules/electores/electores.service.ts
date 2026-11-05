/**
 * Servicio de Electores con paginación y caché Redis.
 * Optimizado para altas consultas concurrentes de electores.
 * Incluye validación segura de cédula con hardening de seguridad.
 */
import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT, REDIS_PREFIX } from '../redis/redis.module';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Elector } from '../../database/entities/elector.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate, PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { logger } from '../../config/logger';

const CACHE_TTL_ELECTORES = 300; // 5 minutos
const CACHE_TTL_ELECTOR = 600; // 10 minutos
const VERIFICACION_CEDULA_TTL = 60; // 1 minuto para rate limiting de cédula
const MAX_VERIFICACIONES_POR_MINUTO = 5; // Máximo 5 consultas de cédula por minuto por usuario

@Injectable()
export class ElectoresService {
  private readonly logger = new Logger(ElectoresService.name);

  constructor(
    @InjectRepository(Elector) private repository: Repository<Elector>,
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private auditoriaService: AuditoriaService,
  ) {}

  private getCacheKey(prefix: string, id?: string | number): string {
    return `${REDIS_PREFIX.CACHE}electores:${prefix}${id ?? ''}`;
  }

  private getRateLimitKey(usuarioId: number): string {
    return `${REDIS_PREFIX.RATE_LIMIT}verificar_cedula:usuario:${usuarioId}`;
  }

  /**
   * Valida que una cédula dominicana tenga 11 dígitos numéricos.
   */
  private validarFormatoCedula(cedula: string): boolean {
    const digitos = cedula.replace(/\D/g, '');
    return digitos.length === 11 && /^\d{11}$/.test(digitos);
  }

  /**
   * Verifica si el usuario ha excedido el límite de consultas de cédula por minuto.
   */
  async verificarRateLimitCedula(usuarioId: number): Promise<void> {
    const key = this.getRateLimitKey(usuarioId);
    const actual = await this.redis.get(key);
    const count = actual ? parseInt(actual, 10) : 0;

    if (count >= MAX_VERIFICACIONES_POR_MINUTO) {
      throw new ForbiddenException(
        'Ha excedido el límite de consultas de cédula por minuto. Intente nuevamente más tarde.',
      );
    }

    // Incrementar contador y establecer expiración si es nuevo
    const multi = this.redis.multi();
    multi.incr(key);
    if (count === 0) {
      multi.expire(key, VERIFICACION_CEDULA_TTL);
    }
    await multi.exec();
  }

  /**
   * Verificación segura de cédula con hardening de seguridad.
   * - Valida formato de cédula (11 dígitos)
   * - Rate limiting: máximo 5 consultas por minuto por usuario
   * - Respuesta uniforme (no revela si existe o no de forma diferenciada)
   * - Solo devuelve nombres y apellidos (datos mínimos)
   * - Filtra por recinto del usuario autenticado (scope restriction)
   * - Auditoria completa de cada consulta
   */
  async verificarCedulaSegura(
    cedula: string,
    usuarioId: number,
    usuarioRole: string,
    usuarioRecinto?: string,
    ipAddress?: string,
  ): Promise<{ existe: boolean; nombres?: string; apellidos?: string }> {
    // 1. Validar formato de cédula
    const digitos = cedula.replace(/\D/g, '');
    if (!this.validarFormatoCedula(cedula)) {
      await this.auditoriaService.registrar({
        usuarioId,
        accion: 'VERIFICAR_CEDULA_FORMATO_INVALIDO',
        cedulaConsultada: cedula,
        resultado: 'formato_invalido',
        ipAddress,
      });
      throw new BadRequestException('Formato de cédula inválido. Debe contener 11 dígitos.');
    }

    // 2. Verificar rate limiting
    await this.verificarRateLimitCedula(usuarioId);

    // 3. Verificar permiso de inscripción (solo usuarios con permiso pueden consultar)
    const rolPermitido = ['admin', 'dirigente', 'coordinador'];
    if (!rolPermitido.includes(usuarioRole)) {
      await this.auditoriaService.registrar({
        usuarioId,
        accion: 'VERIFICAR_CEDULA_SIN_PERMISO',
        cedulaConsultada: digitos,
        resultado: 'sin_permiso',
        ipAddress,
      });
      throw new ForbiddenException('No tiene permiso para verificar cédulas.');
    }

    // 4. Construir query con alcance restringido
    const queryBuilder = this.repository.createQueryBuilder('e')
      .where('e.cedula = :cedula', { cedula: digitos });

    // Scope restriction: si el usuario tiene recinto asignado, solo consultar su recinto
    if (usuarioRecinto) {
      queryBuilder.andWhere('e.recinto = :recinto', { recinto: usuarioRecinto });
    }

    const elector = await queryBuilder.getOne();

    const existe = !!elector;

    // 5. Registrar auditoría (siempre, independientemente del resultado)
    await this.auditoriaService.registrar({
      usuarioId,
      accion: 'VERIFICAR_CEDULA',
      cedulaConsultada: digitos,
      resultado: existe ? 'encontrado' : 'no_encontrado',
      ipAddress,
    });

    // 6. Respuesta uniforme y mínima: solo nombres y apellidos si existe
    // Nunca revelar otros datos del elector
    if (existe && elector) {
      return {
        existe: true,
        nombres: elector.nombres,
        apellidos: elector.apellidos,
      };
    }

    // Respuesta uniforme para no revelar si existe o no
    return {
      existe: false,
    };
  }

  async findAll(
    filters: any,
    pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Elector>> {
    const query = this.repository.createQueryBuilder('e');

    // Filtros
    if (filters.estado) {
      query.andWhere('e.estado = :estado', { estado: filters.estado });
    }
    if (filters.recinto) {
      query.andWhere('e.recinto = :recinto', { recinto: filters.recinto });
    }
    if (filters.mesa) {
      query.andWhere('e.mesa = :mesa', { mesa: filters.mesa });
    }
    if (filters.search) {
      query.andWhere(
        '(e.nombres LIKE :search OR e.apellidos LIKE :search OR e.cedula LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    if (filters.asignadoA) {
      query.andWhere('e.asignadoA = :asignadoA', { asignadoA: filters.asignadoA });
    }

    // Ordenamiento
    const sortField = pagination.sort || 'id';
    const sortOrder = pagination.order || 'ASC';
    query.orderBy(`e.${sortField}`, sortOrder);

    // Paginación
    query.skip(pagination.offset);
    query.take(pagination.take);

    const [items, total] = await query.getManyAndCount();

    return paginate(items, total, pagination.page, pagination.take);
  }

  async findOne(id: number): Promise<Elector> {
    // Intentar caché primero
    const cacheKey = this.getCacheKey('one:', id);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Elector;
      }
    } catch (err) {
      logger.warn(`Error leyendo caché elector ${id}: ${err.message}`, 'ElectoresService');
    }

    const elector = await this.repository.findOne({ where: { id } });
    if (!elector) {
      throw new NotFoundException('Elector no encontrado');
    }

    // Guardar en caché
    try {
      await this.redis.setex(cacheKey, CACHE_TTL_ELECTOR, JSON.stringify(elector));
    } catch (err) {
      logger.warn(`Error guardando caché elector ${id}: ${err.message}`, 'ElectoresService');
    }

    return elector;
  }

  async findByCedula(cedula: string): Promise<Elector | null> {
    const cacheKey = this.getCacheKey('cedula:', cedula);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Elector;
      }
    } catch (err) {
      logger.warn(`Error leyendo caché elector por cedula ${cedula}: ${err.message}`, 'ElectoresService');
    }

    const elector = await this.repository.findOne({ where: { cedula } });

    if (elector) {
      try {
        await this.redis.setex(cacheKey, CACHE_TTL_ELECTOR, JSON.stringify(elector));
      } catch (err) {
        logger.warn(`Error guardando caché elector por cedula ${cedula}: ${err.message}`, 'ElectoresService');
      }
    }

    return elector;
  }

  async create(data: any): Promise<Elector> {
    const elector = this.repository.create(data);
    const saved = await this.repository.save(elector);

    // Invalidar caché de listados
    await this.invalidateListCache();

    return (saved as unknown) as Elector;
  }

  async update(id: number, data: any): Promise<Elector> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException('Elector no encontrado');
    }

    // Invalidar caché
    await this.invalidateElectorCache(id);

    return updated;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Elector no encontrado');
    }

    // Invalidar caché
    await this.invalidateElectorCache(id);
    await this.invalidateListCache();

    return { message: 'Elector eliminado' };
  }

  async fidelizar(id: number): Promise<Elector> {
    const elector = await this.repository.findOne({ where: { id } });
    if (!elector) {
      throw new NotFoundException('Elector no encontrado');
    }

    elector.estado = 'fidelizado';
    const saved = await this.repository.save(elector);

    // Invalidar caché
    await this.invalidateElectorCache(id);
    await this.invalidateListCache();

    return (saved as unknown) as Elector;
  }

  async reconfirmar(id: number): Promise<Elector> {
    const elector = await this.repository.findOne({ where: { id } });
    if (!elector) {
      throw new NotFoundException('Elector no encontrado');
    }

    elector.reconfirmadoAt = new Date();
    const saved = await this.repository.save(elector);

    await this.invalidateElectorCache(id);

    return (saved as unknown) as Elector;
  }

  async getStats(): Promise<{
    total: number;
    fidelizados: number;
    indecisos: number;
    porRecinto: Array<{ recinto: string; count: number }>;
  }> {
    const total = await this.repository.count();
    const fidelizados = await this.repository.count({ where: { estado: 'fidelizado' } });
    const indecisos = await this.repository.count({ where: { estado: 'indeciso' } });

    const porRecinto = await this.repository
      .createQueryBuilder('e')
      .select('e.recinto', 'recinto')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.recinto IS NOT NULL')
      .groupBy('e.recinto')
      .orderBy('count', 'DESC')
      .getRawMany();

    return { total, fidelizados, indecisos, porRecinto };
  }

  private async invalidateElectorCache(id: number): Promise<void> {
    try {
      await this.redis.del(this.getCacheKey('one:', id));
      await this.redis.del(this.getCacheKey('cedula:', ''));
    } catch (err) {
      logger.warn(`Error invalidando caché elector ${id}: ${err.message}`, 'ElectoresService');
    }
  }

  private async invalidateListCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${REDIS_PREFIX.CACHE}electores:list:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (err) {
      logger.warn(`Error invalidando caché de listas: ${err.message}`, 'ElectoresService');
    }
  }
}
