/**
 * Middleware de logging HTTP estructurado.
 * Registra cada request con: método, ruta, status, tiempo, IP, user-agent.
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../config/logger';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggingMiddleware.name);

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] ?? 'unknown';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - IP: ${ip} - UA: ${userAgent}`,
        'HTTP',
        { level: logLevel, method, url: originalUrl, statusCode, duration, ip, userAgent }
      );
    });

    next();
  }
}
