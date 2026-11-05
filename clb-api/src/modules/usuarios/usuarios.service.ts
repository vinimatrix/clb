/**
 * Servicio de Usuarios con paginación y caché Redis.
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { REDIS_PREFIX } from '../../config/redis.config';
import { User } from '../../database/entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate, PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import * as bcrypt from 'bcryptjs';

const CACHE_TTL_USER = 600;

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(User) private usuariosRepository: Repository<User>,
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private cacheKey(prefix: string, id?: string | number): string {
    return `${REDIS_PREFIX.CACHE}usuarios:${prefix}${id ?? ''}`;
  }

  async findAll(
    pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<User & { passwordHash?: string }>> {
    const [items, total] = await this.usuariosRepository.findAndCount({
      select: ['id', 'cedula', 'username', 'nombres', 'apellidos', 'telefono', 'role', 'createdAt'],
      skip: pagination.offset,
      take: pagination.take,
      order: { [pagination.sort]: pagination.order },
    });

    return paginate(items, total, pagination.page, pagination.take);
  }

  async findOne(id: number): Promise<User> {
    const cacheKey = this.cacheKey('one:', id);
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as User;
    } catch (_) {}

    const user = await this.usuariosRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    try {
      await this.redis.setex(cacheKey, CACHE_TTL_USER, JSON.stringify(user));
    } catch (_) {}

    return user;
  }

  async findByCedula(cedula: string): Promise<User | null> {
    return this.usuariosRepository.findOne({ where: { cedula } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usuariosRepository.findOne({ where: { username } });
  }

  async create(data: any): Promise<User> {
    const existing = await this.usuariosRepository.findOne({
      where: [{ cedula: data.cedula }, { username: data.username }],
    });
    if (existing) {
      throw new Error('Usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(data.password, 12); // Salt rounds más altos para seguridad
    const user = this.usuariosRepository.create({
      ...data,
      passwordHash,
      role: data.role || 'coordinador',
    });
    const saved = await this.usuariosRepository.save(user);
    await this.invalidateListCache();
    return (saved as unknown) as User;
  }

  async update(id: number, data: any): Promise<User> {
    const user = await this.usuariosRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.usuariosRepository.update(id, {
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefono: data.telefono,
      role: data.role,
    });

    const updated = await this.usuariosRepository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Usuario no encontrado');

    await this.invalidateUserCache(id);
    await this.invalidateListCache();

    return updated;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.usuariosRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Usuario no encontrado');

    await this.invalidateUserCache(id);
    await this.invalidateListCache();

    return { message: 'Usuario eliminado' };
  }

  async getPermissions(rol: string): Promise<any> {
    const permisosPorRol: any = {
      coordinador: {
        inscripcion: true, miRecinto: false, miCarpeta: false, fidelizados: false,
        cba: false, cbe: false, callcenter: false, admin: false,
      },
      dirigente: {
        inscripcion: true, miRecinto: true, miCarpeta: true, fidelizados: false,
        cba: false, cbe: false, callcenter: false, admin: false,
      },
      admin: {
        inscripcion: true, miRecinto: true, miCarpeta: true, fidelizados: true,
        cba: true, cbe: true, callcenter: true, admin: true,
      },
    };
    return permisosPorRol[rol] || {};
  }

  async updatePermission(rol: string, modulo: string, habilitado: boolean): Promise<any> {
    return { rol, modulo, habilitado: habilitado ? 1 : 0 };
  }

  private async invalidateUserCache(id: number): Promise<void> {
    try {
      await this.redis.del(this.cacheKey('one:', id));
    } catch (_) {}
  }

  private async invalidateListCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${REDIS_PREFIX.CACHE}usuarios:list:*`);
      if (keys.length > 0) await this.redis.del(...keys);
    } catch (_) {}
  }
}
