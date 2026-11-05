/**
 * main.ts - Punto de entrada de la aplicación NestJS.
 * Configuración para producción con MSSQL, Redis, rate limiting, compresión, seguridad y logging.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './config/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Usar el logger de Winston para NestJS
  app.useLogger(logger);

  // Seguridad: Helmet headers
  app.use(helmet());

  // Compresión gzip/brotli
  app.use(compression());

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      exceptionFactory: (errors) => {
        const formatted = errors.map((e) => ({
          field: e.property,
          errors: e.constraints
            ? Object.values(e.constraints)
            : ['Error de validación'],
        }));
        logger.warn(`Validación fallida: ${JSON.stringify(formatted)}`, 'ValidationPipe');
        return {
          statusCode: 400,
          message: 'Error de validación en la solicitud',
          errors: formatted,
        };
      },
    })
  );

  // CORS restringido a dominios configurados
  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o: string) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  const port = parseInt(process.env.PORT ?? '3001', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);

  logger.log(
    `CLB API (PID ${process.pid}) escuchando en http://${host}:${port}/api - Entorno: ${process.env.NODE_ENV ?? 'development'}`,
    'Bootstrap'
  );
}

bootstrap().catch((err) => {
  logger.error(`Error fatal al iniciar la aplicación: ${err.message}`, err.stack, 'Bootstrap');
  process.exit(1);
});

// Manejo graceful shutdown
process.on('SIGTERM', async () => {
  logger.log('SIGTERM recibido, cerrando aplicación...', 'Shutdown');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.log('SIGINT recibido, cerrando aplicación...', 'Shutdown');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error(`Excepción no controlada: ${err.message}`, err.stack, 'Bootstrap');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`Promesa rechazada no controlada: ${reason?.message ?? reason}`, reason?.stack, 'Bootstrap');
  process.exit(1);
});
