# Plan: Escalabilidad Backend CLB (MSSQL Server, Alta Concurrencia)

## Objetivo
Convertir el backend NestJS + SQLite actual en una API enterprise-grade capaz de soportar miles de requests concurrentes de todo un país, con MSSQL Server en Windows Server 2025.

## Áreas críticas de optimización

### 1. Base de datos: MSSQL Server (reemplazar SQLite)
- Driver `mssql` / `tedious` para SQL Server
- Connection pooling configurado (max, min, idleTimeoutMillis, etc.)
- Índices en campos de búsqueda frecuente: `cedula`, `estado`, `recinto`, `mesa`, `cedulaLider`, `codigo`
- Paginación obligatoria en todos los GET (no `getMany()` sin límites)
- Migración de schema para SQL Server

### 2. Clustering / Multi-worker
- Node.js `cluster` nativo (un worker por núcleo CPU) o PM2 en modo cluster
- Cada worker independiente, aislado, con su propia conexión a BD

### 3. Rate Limiting
- `@nestjs/throttler` con almacenamiento en Redis (no memory, para cluster)
- Límites diferentes: auth (estricto), API general (moderado), admin (permisivo)

### 4. Caching (Redis)
- `ioredis` para caché de consultas frecuentes (permisos, configuración, datos de lectura)
- TTL configurable por endpoint
- Invalidación por evento (write → invalidar caché relacionada)

### 5. Middleware de producción
- `compression` (gzip/brotli) para reducir ancho de banda
- `helmet` (headers de seguridad)
- CORS restringido a dominios de producción (no `*`)
- Logging estructurado con `winston` (consola + archivo)
- Health checks con `@nestjs/terminus` (`/health`, `/health/db`, `/health/redis`)

### 6. DTOs y validación
- `class-validator` + `class-transformer` en todos los endpoints
- Rechazo temprano de payloads inválidos (400 Bad Request)

### 7. Graceful shutdown
- Manejo de SIGTERM/SIGINT para cerrar conexiones DB y Redis limpiamente

### 8. JWT
- Secret fuerte desde variable de entorno
- Access token de corta duración + refresh token opcional
- Blacklist de tokens revocados en Redis

## Archivos a crear/modificar

### Modificar:
- `clb-api/package.json` — nuevas dependencias
- `clb-api/.env` — configuración MSSQL, Redis, rate limits
- `clb-api/src/main.ts` — cluster, compression, helmet, throttler, logging, health
- `clb-api/src/app.module.ts` — MSSQL TypeORM, Redis module, Throttler, Terminus
- `clb-api/src/database/entities/*.ts` — índices, tipos SQL Server compatibles

### Crear:
- `clb-api/src/config/database.config.ts` — configuración TypeORM para MSSQL
- `clb-api/src/config/redis.config.ts` — conexión Redis
- `clb-api/src/middleware/rate-limit.middleware.ts` — rate limiting personalizado
- `clb-api/src/middleware/logging.middleware.ts` — logging de requests
- `clb-api/src/common/dto/pagination.dto.ts` — DTO de paginación
- `clb-api/src/common/interfaces/paginated-response.interface.ts` — interfaz respuesta paginada
- `clb-api/src/health/health.module.ts` — health checks
- `clb-api/src/cluster/cluster.entry.ts` — entry point con cluster

## Comandos de ejecución
- Desarrollo: `nest start --watch`
- Producción (Windows Server 2025): `pm2 start ecosystem.config.js` o `node dist/cluster.entry.js`

---