/**
 * Servicio de Comités con paginación y caché Redis.
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { REDIS_PREFIX } from '../../config/redis.config';
import { Comite } from '../../database/entities/comite.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate, PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

const CACHE_TTL_COMITE = 600;

@Injectable()
export class ComitesService {
  private readonly logger = new Logger(ComitesService.name);

  constructor(
    @InjectRepository(Comite) private repository: Repository<Comite>,
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private cacheKey(prefix: string, id?: string | number): string {
    return `${REDIS_PREFIX.CACHE}comites:${prefix}${id ?? ''}`;
  }

  async findAll(
    filters: any,
    pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Comite>> {
    const query = this.repository.createQueryBuilder('c');

    if (filters.tipo) query.andWhere('c.tipo = :tipo', { tipo: filters.tipo });
    if (filters.estado) query.andWhere('c.estado = :estado', { estado: filters.estado });
    if (filters.recinto) query.andWhere('c.recinto = :recinto', { recinto: filters.recinto });

    const sortField = pagination.sort || 'id';
    const sortOrder = pagination.order || 'ASC';
    query.orderBy(`c.${sortField}`, sortOrder);

    query.skip(pagination.offset);
    query.take(pagination.take);

    const [items, total] = await query.getManyAndCount();
    return paginate(items, total, pagination.page, pagination.take);
  }

  async findOne(id: number): Promise<Comite> {
    const cacheKey = this.cacheKey('one:', id);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as Comite;
    } catch (_) {}

    const comite = await this.repository.findOne({ where: { id } });
    if (!comite) throw new NotFoundException('Comité no encontrado');

    try {
      await this.redis.setex(cacheKey, CACHE_TTL_COMITE, JSON.stringify(comite));
    } catch (_) {}

    return comite;
  }

  async create(data: any): Promise<Comite> {
    const comite = this.repository.create(data);
    const saved = await this.repository.save(comite);
    await this.invalidateListCache();
    return (saved as unknown) as Comite;
  }

  async update(id: number, data: any): Promise<Comite> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Comité no encontrado');
    await this.invalidateComiteCache(id);
    return updated;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Comité no encontrado');
    await this.invalidateComiteCache(id);
    await this.invalidateListCache();
    return { message: 'Comité eliminado' };
  }

  async asignarSuplente(comiteId: number, nombre: string): Promise<Comite> {
    const comite = await this.repository.findOne({ where: { id: comiteId } });
    if (!comite) throw new NotFoundException('Comité no encontrado');

    comite.delegados = JSON.stringify({
      ...(comite.delegados ? JSON.parse(comite.delegados) : {}),
      suplente: nombre,
      estado: 'blindado',
    });
    comite.estado = 'blindado';

    const saved = await this.repository.save(comite);
    await this.invalidateComiteCache(comiteId);
    return saved;
  }

  private async invalidateComiteCache(id: number): Promise<void> {
    try {
      await this.redis.del(this.cacheKey('one:', id));
    } catch (_) {}
  }

  private async invalidateListCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${REDIS_PREFIX.CACHE}comites:list:*`);
      if (keys.length > 0) await this.redis.del(...keys);
    } catch (_) {}
  }
}
