/**
 * Configuración de Redis para caché, rate limiting y sesiones.
 */
import * as dotenv from 'dotenv';
import { RedisOptions } from 'ioredis';

dotenv.config();

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT ?? '10000', 10),
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES ?? '10', 10),
  lazyConnect: true, // No fallar si Redis no está disponible al iniciar
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  // Reconectar automáticamente si se cae
  enableReadyCheck: true,
  enableOfflineQueue: false, // No encolar comandos si no hay conexión
  keepAlive: 1000,
  family: 4, // IPv4 preferido en Windows Server
};

export const REDIS_PREFIX = {
  RATE_LIMIT: 'rl:',
  CACHE: 'cache:',
  TOKEN_BLACKLIST: 'bl:',
  SESSION: 'sess:',
  AUDITORIA: 'aud:',
};
