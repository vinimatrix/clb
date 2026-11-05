# CLB App Móvil - Campaña Electoral Carmen Ligia Barceló

> **CLB App Móvil** es una aplicación PWA (Progressive Web App) para la gestión de campañas electorales, diseñada específicamente para el proyecto de **Carmen Ligia Barceló** en Hato Mayor, República Dominicana. Incluye aplicación móvil, panel de administración (backoffice), API REST con MSSQL Server, y autenticación JWT con control de acceso basado en roles (RBAC).

---

## 📋 Tabla de Contenidos

- [Descripción del Sistema](#descripción-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Rápida](#instalación-rápida)
- [Configuración](#configuración)
- [Credenciales de Demo](#credenciales-de-demo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Despliegue en Producción (Windows Server 2025)](#despliegue-en-producción-windows-server-2025)
- [Seguridad](#seguridad)
- [PWA y Offline](#pwa-y-offline)
- [Pruebas](#pruebas)
- [Roadmap](#roadmap)
- [Soporte](#soporte)

---

## 📱 Descripción del Sistema

La CLB App Móvil permite a dirigentes y coordinadores de campaña gestionar el padrón electoral, comités, llamadas, tareas de movilización y reportes desde un dispositivo móvil o desktop.

### Módulos Principales

| Módulo | Descripción |
|--------|-------------|
| **Inscripción** | Registro de electores con verificación JCE (cédula) y asignación a CBA/Celula |
| **Mi Recinto** | Gestión del recinto electoral, padrón por mesa y reporte de incidencias |
| **Mi Carpeta** | Electores asignados al dirigente con tareas de llamada/visita pendientes |
| **Fidelizados** | Red de electores con voto seguro y reconfirmación |
| **CBA** | Comités de Base Afectivos (familias y redes de confianza) |
| **CBE** | Comités de Base Electorales (suplentes y mesas blindadas) |
| **Call Center** | Tele-validación, tipificación de intenciones de voto y transporte |
| **Admin Panel** | Gestión de usuarios, roles, permisos, electores, comités y reportes |

### Roles y Permisos (RBAC)

| Rol | Módulos Accesibles |
|-----|-------------------|
| **Coordinador** | Inscripción |
| **Dirigente** | Inscripción, Mi Recinto, Mi Carpeta, Fidelizados, CBA, CBE, Call Center |
| **Admin** | Todos los módulos + Panel de Administración |

---

## 🛠️ Stack Tecnológico

### Frontend (CLB App Móvil)
- **React 19** con Vite 8
- **Tailwind CSS v3.4** (no v4)
- **react-router-dom v7** para navegación
- **Vitest + Testing Library** para pruebas unitarias
- **PWA**: Service Worker + manifest.json (offline-first)
- **Diseño**: Material Symbols Outlined, Montserrat + Inter

### Backend (CLB API)
- **NestJS 10** (Node.js)
- **TypeORM** con **MSSQL Server** (SQL Server 2022+)
- **JWT** para autenticación (access token 15m + refresh token 7d)
- **Redis** para caché, rate limiting y blacklist de tokens
- **bcryptjs** (salt 12) para hash de contraseñas
- **Winston** para logging estructurado
- **Helmet + Compression** para seguridad y rendimiento
- **@nestjs/throttler** para rate limiting por IP

### Base de Datos
- **MSSQL Server** en Windows Server 2025
- Puerto: 1433
- Índices optimizados para campos de búsqueda frecuente
- Connection pooling (10-100 conexiones concurrentes)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (React PWA)                                            │
│  - Navegador móvil / Desktop                                    │
│  - Service Worker (offline)                                     │
│  - localStorage (fallback)                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS/WSS
┌──────────────────────────────▼──────────────────────────────────┐
│  API REST (NestJS + Node.js Cluster)                            │
│  - Puerto 3001                                                  │
│  - Helmet + Compression + CORS                                  │
│  - Rate Limiting (Redis)                                        │
│  - JWT Auth                                                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ TCP 1433
┌──────────────────────────────▼──────────────────────────────────┐
│  BASE DE DATOS (MSSQL Server)                                   │
│  - CLB_DB                                                       │
│  - Tablas: users, electores, comites, llamadas, tareas           │
│  - Redis (caché, rate limiting, sesiones)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Requisitos Previos

### Para Desarrollo Local
- **Node.js 18+ LTS**
- **npm** o **yarn**
- **Git**
- **SQL Server** (local o remoto) — opcional para desarrollo (usa localStorage como fallback)
- **Redis** — opcional para desarrollo

### Para Producción (Windows Server 2025)
- **Windows Server 2025**
- **Node.js 18+ LTS**
- **SQL Server 2022 o superior**
- **Redis** (para caché y rate limiting)
- **PM2** (gestor de procesos)
- **Puerto 3001** abierto en el firewall

---

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```powershell
git clone https://github.com/vinimatrix/clb.git
cd clb
```

### 2. Instalar dependencias del Frontend

```powershell
cd clb-app
npm install
```

### 3. Instalar dependencias del Backend

```powershell
cd clb-api
npm install --production
```

### 4. Configurar variables de entorno

#### Backend (`clb-api/.env`)

Copia el archivo de ejemplo y edita con tus valores reales:

```powershell
copy clb-api\.env.example clb-api\.env
```

Edita `clb-api\.env` con un editor de texto y configura:

```env
# Servidor
PORT=3001
NODE_ENV=production
WORKER_COUNT=0

# Base de datos MSSQL Server
DB_HOST=sql.pigesolutions.com
DB_PORT=1433
DB_USER=usr_development
DB_PASSWORD=TuPasswordReal
DB_DATABASE=CLB_DB
DB_POOL_MAX=100
DB_POOL_MIN=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (cambiar por valores largos y aleatorios)
JWT_ACCESS_SECRET=TuSecretoMuyLargoYAleatorio
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=TuOtroSecretoMuyLargo
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-dominio.com
```

> ⚠️ **Importante**: El archivo `.env` está en `.gitignore` y **nunca debe commitearse** con credenciales reales.

### 5. Crear la base de datos

Desde una máquina con acceso a sql.pigesolutions.com:

```powershell
sqlcmd -S sql.pigesolutions.com -U usr_development -P "TuPasswordReal" -i clb-api\database\schema_mssql.sql
```

Este script creará:
- Base de datos `CLB_DB`
- Tablas: `users`, `electores`, `comites`, `llamadas`, `tareas`
- Índices optimizados
- 3 usuarios por defecto (admin, coordinador, dirigente)

### 6. Compilar y ejecutar el Backend

```powershell
cd clb-api
npm run build
npm run pm2:start
```

Verificar que el API esté corriendo:
```powershell
curl http://localhost:3001/api/health
```

### 7. Compilar y ejecutar el Frontend

```powershell
cd clb-app
npm run build
npm run preview
```

O para desarrollo:
```powershell
npm.cmd run dev -- --port 5173 --strictPort
```

---

## 🔑 Credenciales de Demo

| Usuario | Cédula | Contraseña | Rol |
|---------|--------|------------|-----|
| Admin | 402-1234567-0 | ClbSegura2026@ | Admin |
| Coordinador | 402-1234567-9 | ClbSegura2026@ | Coordinador |
| Dirigente (Demo) | 402-1234567-8 | ClbSegura2026@ | Miembro (mapeado a Dirigente) |

> ⚠️ Cambia estas contraseñas inmediatamente en producción.

---

## 📁 Estructura del Proyecto

```
clb/
├── clb-app/                          # Frontend React + Vite
│   ├── src/
│   │   ├── pages/app/               # Páginas de la aplicación
│   │   │   ├── AdminPanel.jsx       # Panel de administración (matriz de permisos)
│   │   │   ├── AdminUsers.jsx       # Gestión de usuarios
│   │   │   ├── AdminRoles.jsx       # Gestión de roles y permisos
│   │   │   ├── AdminElectores.jsx   # Gestión de electores
│   │   │   ├── AdminComites.jsx     # Gestión de comités
│   │   │   ├── AdminReportes.jsx    # Reportes y estadísticas
│   │   │   ├── Dashboard.jsx        # Dashboard ejecutivo
│   │   │   ├── MiRecinto.jsx        # Gestión de recinto
│   │   │   ├── Padron.jsx           # Padrón electoral
│   │   │   ├── MiCarpeta.jsx        # Carpeta del dirigente
│   │   │   ├── Fidelizados.jsx      # Red de fidelizados
│   │   │   ├── Cba.jsx              # Comités CBA
│   │   │   ├── Cbe.jsx              # Comités CBE
│   │   │   ├── CallCenter.jsx       # Call Center
│   │   │   ├── Perfil.jsx           # Perfil de usuario
│   │   │   ├── Mas.jsx              # Centro Más (menú de herramientas)
│   │   │   └── Inscripcion.jsx      # Inscripción de electores
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── AppLayout.jsx        # Layout con Sidebar + BottomNav
│   │   │   ├── Sidebar.jsx          # Sidebar para desktop/tablet
│   │   │   ├── BottomNav.jsx        # Navegación inferior para móvil
│   │   │   └── ...
│   │   ├── store/                   # Gestión de estado (AppContext + actions)
│   │   ├── lib/                     # Utilidades (api-client, storage, hash, format)
│   │   ├── test/                    # Pruebas Vitest
│   │   └── registerSW.jsx           # Registro del Service Worker
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   └── icons/                   # Íconos PWA
│   ├── scripts/
│   │   └── e2e.mjs                  # Pruebas E2E con Playwright
│   └── package.json
│
├── clb-api/                         # Backend NestJS
│   ├── src/
│   │   ├── main.ts                  # Punto de entrada
│   │   ├── cluster.entry.ts         # Entry point con clustering
│   │   ├── app.module.ts            # Módulo raíz
│   │   ├── config/                  # Configuración (BD, Redis, Logger)
│   │   │   ├── database.config.ts   # TypeORM + MSSQL
│   │   │   ├── redis.config.ts      # Conexión Redis
│   │   │   └── logger.ts            # Winston logger
│   │   ├── modules/
│   │   │   ├── auth/                # Autenticación (login, register, JWT)
│   │   │   ├── electores/           # CRUD electores
│   │   │   ├── comites/             # CRUD comités
│   │   │   ├── llamadas/            # CRUD llamadas
│   │   │   ├── usuarios/            # CRUD usuarios y permisos
│   │   │   ├── health/              # Health checks
│   │   │   ├── redis/               # Módulo Redis
│   │   │   └── throttler/           # Rate limiting con Redis
│   │   ├── middleware/              # Middleware (logging HTTP)
│   │   ├── database/entities/       # Entidades TypeORM
│   │   └── common/                  # DTOs e interfaces
│   ├── database/
│   │   └── schema_mssql.sql         # Esquema SQL Server
│   ├── logs/                        # Archivos de log
│   ├── ecosystem.config.js          # Configuración PM2
│   ├── .env.example                 # Plantilla de variables de entorno
│   └── package.json
│
└── .gitignore
```

---

## 🔌 Endpoints de la API

Todas las rutas están bajo el prefijo `/api`.

### Autenticación (Público)
| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/login` | Iniciar sesión | 10/min |
| POST | `/api/auth/register` | Registrar usuario | 10/min |
| POST | `/api/auth/refresh` | Renovar access token | 10/min |
| POST | `/api/auth/logout` | Cerrar sesión | 60/min |
| GET | `/api/auth/me` | Obtener usuario actual | 60/min |

### Electores (Requiere autenticación)
| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/electores` | Listar electores (paginado) | 100/min |
| GET | `/api/electores/:id` | Obtener elector por ID | 100/min |
| GET | `/api/electores/cedula/:cedula` | Buscar por cédula | 100/min |
| GET | `/api/electores/stats` | Estadísticas | 100/min |
| POST | `/api/electores` | Crear elector | 30/min |
| PUT | `/api/electores/:id` | Actualizar elector | 30/min |
| DELETE | `/api/electores/:id` | Eliminar elector | 30/min |
| PUT | `/api/electores/:id/fidelizar` | Marcar como fidelizado | 30/min |
| PUT | `/api/electores/:id/reconfirmar` | Reconfirmar voto | 30/min |

### Comités
| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/comites` | Listar comités (paginado) | 100/min |
| GET | `/api/comites/:id` | Obtener comité por ID | 100/min |
| POST | `/api/comites` | Crear comité | 30/min |
| PUT | `/api/comites/:id` | Actualizar comité | 30/min |
| DELETE | `/api/comites/:id` | Eliminar comité | 30/min |
| PUT | `/api/comites/:id/asignar-suplente` | Asignar suplente CBE | 30/min |

### Llamadas (Call Center)
| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/llamadas` | Listar llamadas (paginado) | 100/min |
| GET | `/api/llamadas/stats` | Estadísticas de llamadas | 100/min |
| GET | `/api/llamadas/:id` | Obtener llamada por ID | 100/min |
| POST | `/api/llamadas` | Crear llamada | 30/min |
| PUT | `/api/llamadas/:id` | Actualizar llamada | 30/min |
| DELETE | `/api/llamadas/:id` | Eliminar llamada | 30/min |
| PUT | `/api/llamadas/:id/completar` | Marcar como completada | 30/min |

### Usuarios (Solo Admin)
| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/usuarios` | Listar usuarios (paginado) | 100/min |
| GET | `/api/usuarios/:id` | Obtener usuario por ID | 100/min |
| POST | `/api/usuarios` | Crear usuario | 30/min |
| PUT | `/api/usuarios/:id` | Actualizar usuario | 30/min |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | 30/min |
| GET | `/api/usuarios/permisos/:rol` | Obtener permisos por rol | 100/min |
| PUT | `/api/usuarios/permisos/:rol/:modulo` | Cambiar permiso de rol | 500/min |

### Health Checks
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado general (DB + Redis) |
| GET | `/api/health/db` | Estado de base de datos |
| GET | `/api/health/redis` | Estado de Redis |

---

## 🖥️ Despliegue en Producción (Windows Server 2025)

### 1. Preparar el servidor

```powershell
# Instalar Node.js 18+ LTS
# Instalar SQL Server 2022+
# Instalar Redis para Windows
# Instalar PM2 globalmente
npm install -g pm2
```

### 2. Desplegar el backend

```powershell
cd clb-api
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Verificar el despliegue

```powershell
# Estado de procesos PM2
pm2 list

# Health check
curl http://localhost:3001/api/health

# Logs
pm2 logs clb-api
```

### 4. Configurar el frontend para producción

Edita `clb-app/src/lib/api-client.js`:

```javascript
const API_BASE_URL = 'https://tu-dominio.com/api';  // URL real del backend
const USE_API = true;
```

Luego compila:
```powershell
cd clb-app
npm run build
```

Sirve el contenido de `clb-app/dist/` con cualquier servidor web (IIS, Nginx, Apache, etc.).

---

## 🔒 Seguridad

### Implementado
- ✅ **Helmet** — Headers de seguridad HTTP
- ✅ **Compresión gzip/brotli** — Reducción de ancho de banda
- ✅ **CORS restringido** — Solo dominios configurados
- ✅ **Rate Limiting** — Por IP y tipo de endpoint (Redis backend)
- ✅ **JWT Access Token** — Duración corta (15 minutos)
- ✅ **JWT Refresh Token** — Duración larga (7 días) con blacklist en Redis
- ✅ **bcryptjs salt 12** — Hash de contraseñas
- ✅ **Validación de entrada** — class-validator + class-transformer
- ✅ **Logging estructurado** — Winston con archivos rotativos
- ✅ **Graceful shutdown** — Manejo de SIGTERM/SIGINT
- ✅ **Connection pooling** — MSSQL con 10-100 conexiones
- ✅ **Índices en BD** — Campos de búsqueda frecuente indexados

### Recomendaciones para Producción
- Cambiar todas las contraseñas por defecto
- Usar certificados SSL/TLS válidos
- Configurar firewall para permitir solo puertos necesarios (3001, 1433, 6379)
- Rotar secretos JWT periódicamente
- Monitorear logs de error en `clb-api/logs/`

---

## 📱 PWA y Offline

La aplicación es una Progressive Web App completa:

### Características PWA
- ✅ **Service Worker** — Cache de assets estáticos y estrategia de red para API
- ✅ **Manifest.json** — Instalable como aplicación nativa
- ✅ **Offline-first** — Funciona sin conexión usando localStorage
- ✅ **Sincronización automática** — Cola de acciones pendientes que se sincroniza al recuperar conexión
- ✅ **Íconos adaptativos** — 192x192 y 512x512

### Flujo Offline
1. Usuario realiza acciones sin conexión
2. Las acciones se guardan en `clb.offlineQueue` en localStorage
3. Al recuperar conexión, `flushOfflineQueue()` procesa la cola contra la API
4. Se muestra toast de confirmación al completarse

---

## 🧪 Pruebas

### Pruebas Unitarias (Vitest)

```powershell
cd clb-app
npm.cmd run test
```

Resultado esperado: **144 tests pasando** en 26 archivos.

### Pruebas E2E (Playwright)

```powershell
# 1. Iniciar el servidor de desarrollo
npm.cmd run dev -- --port 5173 --strictPort

# 2. Ejecutar pruebas E2E
node scripts/e2e.mjs
```

Resultado esperado: **26 pasos pasando** (flujo Dirigente + flujo Coordinador), 0 errores de consola.

---

## 🗺️ Roadmap

- [x] PWA con Service Worker y offline
- [x] API REST con NestJS + MSSQL Server
- [x] Backoffice con RBAC (3 roles × 8 módulos)
- [x] Versiones web y tablet responsivas
- [x] Rate limiting con Redis
- [x] Health checks
- [ ] Notificaciones push
- [ ] Exportación a Excel/PDF
- [ ] Sincronización en tiempo real (WebSockets)
- [ ] App nativa (Capacitor/React Native)

---

## 📞 Soporte

Para soporte técnico o reportar problemas:

- **Proyecto**: Carmen Ligia Barceló — Hato Mayor, República Dominicana
- **Repositorio**: https://github.com/vinimatrix/clb
- **Rama**: `feature/clb-app-movil`

---

## 📄 Licencia

Este proyecto es privado y pertenece al equipo de campaña de Carmen Ligia Barceló. Todos los derechos reservados.

---

**Última actualización**: Noviembre 2026  
**Versión**: 2.4.0
