/**
 * Controlador de salud del sistema.
 */
import {
  Controller,
  Get,
  Inject,
  Logger,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.db.pingCheck('database', { timeout: 3000 }),
      async () => {
        try {
          await this.redis.ping();
          return { redis: { status: 'up' } };
        } catch (err) {
          this.logger.warn(`Redis health check failed: ${err.message}`);
          return { redis: { status: 'down', message: err.message } };
        }
      },
    ]);
  }

  @Get('db')
  @HealthCheck()
  async checkDb(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }

  @Get('redis')
  async checkRedis(): Promise<{ status: string; latency?: number }> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: 'up', latency: Date.now() - start };
    } catch (err) {
      return { status: 'down', latency: Date.now() - start };
    }
  }
}
