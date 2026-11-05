/**
 * AppModule - Módulo raíz con toda la infraestructura de producción:
 * - TypeORM + MSSQL Server (connection pooling)
 * - Redis (caché, rate limiting, sesiones)
 * - Throttler (rate limiting por IP y tipo de endpoint)
 * - Terminus (health checks)
 * - Todos los módulos de negocio
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ElectoresModule } from './modules/electores/electores.module';
import { ComitesModule } from './modules/comites/comites.module';
import { LlamadasModule } from './modules/llamadas/llamadas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RedisModule } from './modules/redis/redis.module';
import { ThrottlerConfigModule } from './modules/throttler/throttler.module';
import { HealthModule } from './modules/health/health.module';
import { HttpLoggingMiddleware } from './middleware/http-logging.middleware';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    ElectoresModule,
    ComitesModule,
    LlamadasModule,
    UsuariosModule,
    RedisModule,
    ThrottlerConfigModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes(
        { path: 'api/auth/*', method: RequestMethod.ALL },
        { path: 'api/electores/*', method: RequestMethod.ALL },
        { path: 'api/comites/*', method: RequestMethod.ALL },
        { path: 'api/llamadas/*', method: RequestMethod.ALL },
        { path: 'api/usuarios/*', method: RequestMethod.ALL },
      );
  }
}
