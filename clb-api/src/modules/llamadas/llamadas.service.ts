/**
 * Servicio de Llamadas con paginación y caché Redis.
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { REDIS_PREFIX } from '../../config/redis.config';
import { Llamada } from '../../database/entities/llamada.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate, PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

const CACHE_TTL_LLAMADA = 300;

@Injectable()
export class LlamadasService {
  private readonly logger = new Logger(LlamadasService.name);

  constructor(
    @InjectRepository(Llamada) private repository: Repository<Llamada>,
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private cacheKey(prefix: string, id?: string | number): string {
    return `${REDIS_PREFIX.CACHE}llamadas:${prefix}${id ?? ''}`;
  }

  async findAll(
    filters: any,
    pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Llamada>> {
    const query = this.repository.createQueryBuilder('l');

    if (filters.estado) query.andWhere('l.estado = :estado', { estado: filters.estado });
    if (filters.recinto) query.andWhere('l.recinto = :recinto', { recinto: filters.recinto });

    query.orderBy('l.creadoEn', 'DESC');
    query.skip(pagination.offset);
    query.take(pagination.take);

    const [items, total] = await query.getManyAndCount();
    return paginate(items, total, pagination.page, pagination.take);
  }

  async findOne(id: number): Promise<Llamada> {
    const cacheKey = this.cacheKey('one:', id);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as Llamada;
    } catch (_) {}

    const llamada = await this.repository.findOne({ where: { id } });
    if (!llamada) throw new NotFoundException('Llamada no encontrada');

    try {
      await this.redis.setex(cacheKey, CACHE_TTL_LLAMADA, JSON.stringify(llamada));
    } catch (_) {}

    return llamada;
  }

  async create(data: any): Promise<Llamada> {
    const llamada = this.repository.create(data);
    return (await this.repository.save(llamada)) as unknown as Llamada;
  }

  async update(id: number, data: any): Promise<Llamada> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Llamada no encontrada');
    return updated;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Llamada no encontrada');
    return { message: 'Llamada eliminada' };
  }

  async completar(id: number): Promise<Llamada> {
    const llamada = await this.repository.findOne({ where: { id } });
    if (!llamada) throw new NotFoundException('Llamada no encontrada');

    llamada.completado = true;
    llamada.estado = 'completada';
    llamada.completadoAt = new Date();

    return this.repository.save(llamada);
  }

  async getStats(): Promise<{
    total: number;
    completadas: number;
    pendientes: number;
    completadasHoy: number;
  }> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const total = await this.repository.count();
    const completadas = await this.repository.count({ where: { completado: true } });
    const pendientes = await this.repository.count({ where: { completado: false } });
    const completadasHoy = await this.repository.count({
      where: {
        completado: true,
        completadoAt: Between(hoy, manana),
      },
    });

    return { total, completadas, pendientes, completadasHoy };
  }
}
