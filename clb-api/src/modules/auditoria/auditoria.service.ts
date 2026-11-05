import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT, REDIS_PREFIX } from '../redis/redis.module';
import { Auditoria } from '../../database/entities/auditoria.entity';

const AUDITORIA_TTL = 86400 * 30; // 30 días en Redis

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Auditoria) private auditoriaRepository: Repository<Auditoria>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async registrar(params: {
    usuarioId: number;
    accion: string;
    cedulaConsultada?: string;
    resultado?: string;
    ipAddress?: string;
  }): Promise<void> {
    try {
      const auditoria = this.auditoriaRepository.create({
        usuarioId: params.usuarioId,
        accion: params.accion,
        cedulaConsultada: params.cedulaConsultada ?? null,
        resultado: params.resultado ?? null,
        ipAddress: params.ipAddress ?? null,
      });
      await this.auditoriaRepository.save(auditoria);

      // También guardar en Redis para acceso rápido (últimas 100 consultas por usuario)
      const redisKey = `${REDIS_PREFIX.AUDITORIA}usuario:${params.usuarioId}`;
      const entry = {
        accion: params.accion,
        cedula: params.cedulaConsultada,
        resultado: params.resultado,
        fecha: new Date().toISOString(),
      };
      await this.redis.lpush(redisKey, JSON.stringify(entry));
      await this.redis.ltrim(redisKey, 0, 99); // Mantener solo las últimas 100
      await this.redis.expire(redisKey, AUDITORIA_TTL);
    } catch (err) {
      // No fallar la operación principal si la auditoría falla
      this.logger.warn(`Error registrando auditoría: ${err.message}`);
    }
  }

  async obtenerHistorial(usuarioId: number, limite: number = 50): Promise<any[]> {
    try {
      return this.auditoriaRepository.find({
        where: { usuarioId },
        order: { fecha: 'DESC' },
        take: limite,
      });
    } catch (err) {
      this.logger.warn(`Error obteniendo historial de auditoría: ${err.message}`);
      return [];
    }
  }
}
