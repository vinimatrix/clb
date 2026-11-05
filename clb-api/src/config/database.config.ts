/**
 * Configuración de TypeORM para MSSQL Server (Windows Server 2025)
 * Optimizada para alta concurrencia con connection pooling.
 */
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: DataSourceOptions = {
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '1433', 10),
  username: process.env.DB_USER || 'clb_app',
  password: process.env.DB_PASSWORD || 'CambiarEstaContrasenaSegura2025!',
  database: process.env.DB_DATABASE || 'CLB_DB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? '30000', 10),
  },
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT ?? '30000', 10),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX ?? '100', 10),
    min: parseInt(process.env.DB_POOL_MIN ?? '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? '30000', 10),
  },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development' ? ['error', 'query', 'schema'] : ['error'],
  cache: false,
};
