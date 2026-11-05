/**
 * Health checks con @nestjs/terminus.
 * Endpoints: /health (general), /health/db (base de datos), /health/redis (caché)
 */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisModule } from '../redis/redis.module';
import { REDIS_CLIENT } from '../redis/redis.module';

@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator],
})
export class HealthModule {}
