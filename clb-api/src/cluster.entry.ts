/**
 * Entry point del cluster para alta concurrencia.
 * Lanza un worker por núcleo CPU en producción.
 * En desarrollo, ejecuta una sola instancia con hot-reload.
 */
import cluster from 'cluster';
import { cpus } from 'os';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const workerCount = parseInt(process.env.WORKER_COUNT ?? '0', 10);
const numCPUs = workerCount > 0 ? workerCount : cpus().length;
const isProduction = process.env.NODE_ENV === 'production';
const isClusterEnabled = process.env.CLUSTER_ENABLED !== 'false' && isProduction;

if (isClusterEnabled && cluster.isPrimary) {
  console.log(`[CLB API] Primary ${process.pid} iniciando ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(
      `[CLB API] Worker ${worker.process.pid} murió (code: ${code}, signal: ${signal}). Reconectando...`
    );
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`[CLB API] Worker ${worker.process.pid} en línea`);
  });
} else {
  // Cada worker ejecuta la aplicación NestJS
  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('./app.module');
  const { ValidationPipe } = require('@nestjs/common');
  const helmet = require('helmet');
  const compression = require('compression');
  const { logger } = require('./config/logger');

  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    // Seguridad
    app.use(helmet());
    app.use(compression());

    // Validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
      })
    );

    // CORS restringido a dominios de producción
    const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((o: string) => o.trim())
      .filter(Boolean);

    app.enableCors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    });

    // Prefijo global de API
    app.setGlobalPrefix('api');

    const port = parseInt(process.env.PORT ?? '3001', 10);
    await app.listen(port, '0.0.0.0');

    logger.log(
      `CLB API Worker ${process.pid} escuchando en puerto ${port} (${process.env.NODE_ENV ?? 'development'})`,
      'Bootstrap'
    );
  }

  bootstrap().catch((err) => {
    console.error('[CLB API] Error al iniciar:', err);
    process.exit(1);
  });
}
