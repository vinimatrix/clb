/**
 * Logger estructurado con Winston para producción.
 * Escribe a consola y a archivos rotativos por nivel.
 */
import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logDir = process.env.LOG_DIR || './logs';

// Asegurar directorio de logs
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.printf(
    ({ level, message, timestamp, stack, ...meta }) => {
      const msg = stack || message;
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level}: ${msg}${metaStr}`;
    }
  )
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'clb-api' },
  transports: [
    // Consola (formato legible, solo en desarrollo o si se desea)
    new transports.Console({
      format: process.env.NODE_ENV === 'development' ? consoleFormat : logFormat,
    }),
    // Archivo de errores
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5 MB
      maxFiles: 5,
    }),
    // Archivo combinado (todos los niveles)
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5 MB
      maxFiles: 5,
    }),
    // Archivo de acceso HTTP (solo info y superior)
    new transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
  exitOnError: false,
});

export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
