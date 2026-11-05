/**
 * Módulo de Rate Limiting con Throttler + Redis.
 * Almacena los contadores en Redis para que funcione en cluster (múltiples workers).
 */
import { Module, Global } from '@nestjs/common';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { RedisModule } from '../redis/redis.module';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

/**
 * Interfaz local de ThrottlerStorageRecord (no exportada por @nestjs/throttler v5).
 */
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number | null;
}

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT_AUTH ?? '10', 10),
      },
      {
        name: 'general',
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT_GENERAL ?? '100', 10),
      },
      {
        name: 'admin',
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT_ADMIN ?? '500', 10),
      },
      {
        name: 'write',
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_LIMIT_WRITE ?? '30', 10),
      },
    ]),
    RedisModule,
  ],
  providers: [
    {
      provide: ThrottlerStorage,
      useFactory: (redis: Redis) => {
        return new RedisThrottlerStorage(redis);
      },
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [ThrottlerModule, ThrottlerStorage],
})
export class ThrottlerConfigModule {}

/**
 * Almacenamiento de Throttler en Redis para soporte de cluster.
 * Usa ThrottlerStorageRecord importado de @nestjs/throttler.
 */
class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly prefix = 'throttler:';

  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `${this.prefix}${key}`;
    const multi = this.redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, ttl);
    const results = await multi.exec();
    const totalHits = (results?.[0]?.[1] as number) ?? 1;
    const timeToExpire = Date.now() + ttl * 1000;
    const isBlocked = totalHits > limit;
    const timeToBlockExpire = isBlocked ? timeToExpire : null;
    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire } as ThrottlerStorageRecord;
  }

  async decrement(key: string): Promise<void> {
    await this.redis.decr(`${this.prefix}${key}`);
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`${this.prefix}${key}`);
  }

  async get(key: string): Promise<ThrottlerStorageRecord | null> {
    const value = await this.redis.get(`${this.prefix}${key}`);
    if (!value) return null;
    const totalHits = parseInt(value, 10);
    const timeToExpire = Date.now() + 60 * 1000;
    return {
      totalHits,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: null,
    } as ThrottlerStorageRecord;
  }
}
