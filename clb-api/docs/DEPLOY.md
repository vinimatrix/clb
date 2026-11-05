# 🚀 CLB API - Guía de Despliegue en Producción (Windows Server 2025 + MSSQL Server)

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Windows Server 2025                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Node.js   │  │   Redis     │  │  SQL Server 2022+   │ │
│  │  (Cluster)  │  │   (Cache)   │  │   (CLB_DB)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│  pm2 cluster mode      puerto 6379           puerto 1433   │
│         │                │                     │            │
│  └───────────────────────┴─────────────────────┘            │
│           Puerto 3001 (API REST NestJS)                     │
└─────────────────────────────────────────────────────────────┘
```

## Requisitos previos

### Windows Server 2025
- Node.js 18+ LTS
- SQL Server 2022 o superior (MSSQL)
- Redis para Windows (o Redis en WSL2/Docker)
- PM2 (process manager)

### Puerto de red
- 3001: API REST (NestJS)
- 1433: SQL Server
- 6379: Redis

---

## 1. Instalación de dependencias

```powershell
# En el directorio clb-api
npm install --production
npm install -g pm2
```

## 2. Configuración de base de datos (MSSQL)

Crear la base de datos y tablas:

```powershell
sqlcmd -S localhost\SQLEXPRESS -U sa -P '<password_sa>' -i database\schema_mssql.sql
```

O usar SQL Server Management Studio para ejecutar `database\schema_mssql.sql`.

**Usuario por defecto creado:**
- cédula: `402-1234567-8`, usuario: `clbarcelo2026`, contraseña: `ClbSegura2026@`, rol: `admin`
- cédula: `402-1234567-9`, usuario: `coord1`, contraseña: `ClbSegura2026@`, rol: `coordinador`

> ⚠️ Cambiar las contraseñas en producción inmediatamente.

## 3. Configuración de variables de entorno

Copiar y editar `.env`:

```powershell
copy .env .env.production
# Editar .env.production con los valores reales de producción
```

Variables críticas para producción:
- `DB_HOST` - Servidor SQL Server
- `DB_USER` / `DB_PASSWORD` - Credenciales SQL Server
- `JWT_ACCESS_SECRET` - Secreto fuerte para JWT access token
- `JWT_REFRESH_SECRET` - Secreto fuerte para JWT refresh token
- `CORS_ORIGIN` - Dominios permitidos (ej: `https://app.clb.do`)
- `REDIS_HOST` / `REDIS_PORT` - Servidor Redis
- `NODE_ENV=production`
- `WORKER_COUNT=0` (usar todos los núcleos CPU)

## 4. Despliegue con PM2 (modo cluster)

```powershell
# Compilar TypeScript
npm run build

# Iniciar con PM2 en modo cluster (un worker por núcleo CPU)
pm2 start ecosystem.config.js

# Guardar lista de procesos
pm2 save

# Configurar inicio automático con Windows
pm2 startup
```

## 5. Verificación del despliegue

```powershell
# Health check general
curl http://localhost:3001/api/health

# Health check de base de datos
curl http://localhost:3001/api/health/db

# Health check de Redis
curl http://localhost:3001/api/health/redis

# Ver procesos PM2
pm2 list
```

## 6. Monitoreo y logs

```powershell
# Ver logs de PM2
pm2 logs clb-api

# Ver logs de aplicación (Winston)
Get-Content -Path logs/combined.log -Tail 50 -Wait

# Ver logs de errores
Get-Content -Path logs/error.log -Tail 50 -Wait
```

## 7. Endpoints principales

| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/login` | Autenticación | 10/min |
| POST | `/api/auth/register` | Registro | 10/min |
| POST | `/api/auth/refresh` | Renovar token | 10/min |
| POST | `/api/auth/logout` | Cerrar sesión | 60/min |
| GET | `/api/electores` | Listar electores (paginado) | 100/min |
| GET | `/api/electores/:id` | Obtener elector | 100/min |
| POST | `/api/electores` | Crear elector | 30/min |
| PUT | `/api/electores/:id` | Actualizar elector | 30/min |
| GET | `/api/comites` | Listar comités (paginado) | 100/min |
| GET | `/api/llamadas` | Listar llamadas (paginado) | 100/min |
| GET | `/api/usuarios` | Listar usuarios (paginado) | 100/min |
| GET | `/api/health` | Health check | Sin límite |

## 8. Seguridad implementada

- ✅ Helmet (headers de seguridad HTTP)
- ✅ Compresión gzip/brotli
- ✅ CORS restringido a dominios configurados
- ✅ Rate limiting por IP (Redis backend, funciona en cluster)
- ✅ JWT access token (15 min) + refresh token (7 días)
- ✅ Blacklist de refresh tokens en Redis
- ✅ Validación de entrada con class-validator
- ✅ Logging estructurado con Winston (archivos rotativos)
- ✅ Health checks (DB, Redis)
- ✅ Graceful shutdown (SIGTERM/SIGINT)
- ✅ Connection pooling MSSQL (máx 100 conexiones)
- ✅ Índices en BD para campos de búsqueda frecuente
- ✅ Paginación obligatoria en todos los GET

## 9. Escalabilidad

- **Vertical**: Aumentar `DB_POOL_MAX` y `DB_POOL_MIN` según RAM disponible
- **Horizontal**: PM2 cluster mode usa todos los núcleos CPU
- **Caché**: Redis almacena consultas frecuentes (TTL configurable)
- **Conexiones**: Pool de MSSQL con 10-100 conexiones concurrentes

## 10. Solución de problemas

| Problema | Solución |
|----------|----------|
| Error de conexión SQL Server | Verificar `DB_HOST`, `DB_USER`, `DB_PASSWORD` en `.env` |
| Redis no disponible | La app continúa sin caché; verificar servicio Redis |
| Rate limiting muy estricto | Ajustar `RATE_LIMIT_LIMIT_*` en `.env` |
| Out of memory | Ajustar `max_memory_restart` en `ecosystem.config.js` |
| Build falla | Verificar que todas las dependencias estén instaladas |

---

**Soporte:** CLB Campaign App - Equipo Técnico
