/**
 * Servicio de Auth con JWT, refresh tokens y blacklist en Redis.
 * Optimizado para alta concurrencia de login.
 */
import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { REDIS_PREFIX } from '../../config/redis.config';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcryptjs';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'default-access-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret-change-me';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private usuariosRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async validateUser(cedula: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findOne({ where: { cedula } });
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    // Access token de corta duración
    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: ACCESS_EXPIRES_IN,
    });

    // Refresh token de larga duración, guardado en Redis
    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: REFRESH_EXPIRES_IN,
    });

    // Almacenar refresh token en Redis con TTL
    const refreshKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}refresh:${user.id}`;
    try {
      await this.redis.setex(refreshKey, 7 * 24 * 60 * 60, refreshToken);
    } catch (err) {
      this.logger.warn(`Error guardando refresh token en Redis: ${err.message}`, 'AuthService');
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60, // 15 minutos en segundos
      user: {
        id: user.id,
        cedula: user.cedula,
        username: user.username,
        nombres: user.nombres,
        apellidos: user.apellidos,
        role: user.role,
        telefono: user.telefono,
      },
    };
  }

  async refresh(refreshToken: string, userId: number) {
    // Verificar que el refresh token exista en Redis
    const refreshKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}refresh:${userId}`;
    try {
      const stored = await this.redis.get(refreshKey);
      if (!stored || stored !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`Error verificando refresh token: ${err.message}`, 'AuthService');
      throw new UnauthorizedException('Error verificando sesión');
    }

    const user = await this.usuariosRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    return this.login(user);
  }

  async logout(userId: number): Promise<{ message: string }> {
    const refreshKey = `${REDIS_PREFIX.TOKEN_BLACKLIST}refresh:${userId}`;
    try {
      await this.redis.del(refreshKey);
    } catch (err) {
      this.logger.warn(`Error eliminando refresh token: ${err.message}`, 'AuthService');
    }
    return { message: 'Sesión cerrada' };
  }

  async register(userData: any) {
    const { cedula, username, password, nombres, apellidos, telefono, role } = userData;

    const existing = await this.usuariosRepository.findOne({
      where: [{ cedula }, { username }],
    });
    if (existing) {
      throw new Error('Usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.usuariosRepository.create({
      cedula,
      username,
      passwordHash,
      nombres,
      apellidos,
      telefono,
      role: role || 'coordinador',
    });
    const saved = await this.usuariosRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async findAll() {
    return this.usuariosRepository.find({
      select: ['id', 'cedula', 'username', 'nombres', 'apellidos', 'telefono', 'role', 'createdAt'],
    });
  }

  async updateRole(id: number, role: string) {
    await this.usuariosRepository.update(id, { role });
    return this.usuariosRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    await this.usuariosRepository.delete(id);
    return { message: 'Usuario eliminado' };
  }
}
