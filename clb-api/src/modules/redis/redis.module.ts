/**
 * Módulo de Redis - Provider global para caché y rate limiting.
 * Usa ioredis con lazyConnect para no fallar si Redis no está disponible.
 */
import { Module, Global, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig, REDIS_PREFIX } from '../../config/redis.config';
import { logger } from '../../config/logger';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_PREFIX_TOKEN = 'REDIS_PREFIX';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (): Promise<Redis> => {
        const client = new Redis(redisConfig);
        client.on('connect', () => logger.log('Redis conectado', 'RedisModule'));
        client.on('error', (err) => logger.error(`Redis error: ${err.message}`, 'RedisModule'));
        client.on('reconnecting', () => logger.warn('Redis reconectando...', 'RedisModule'));
        await client.connect();
        return client;
      },
    },
    {
      provide: REDIS_PREFIX_TOKEN,
      useValue: REDIS_PREFIX,
    },
  ],
  exports: [REDIS_CLIENT, REDIS_PREFIX_TOKEN],
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit() {
    try {
      await this.redis.ping();
      logger.log('Redis verificado y operativo', 'RedisModule');
    } catch (err) {
      logger.warn(`Redis no disponible, continuando sin caché: ${err.message}`, 'RedisModule');
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
      logger.log('Redis desconectado limpiamente', 'RedisModule');
    } catch (_) {
      // Ignorar errores al cerrar
    }
  }
}
