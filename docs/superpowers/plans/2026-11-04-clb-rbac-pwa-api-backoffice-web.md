# CLB PWA + API + Backoffice + Web/Tablet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar PWA (offline/service worker), API REST (backend real), Backoffice (administración completa de usuarios/roles/permisos/electores) y versión web/tablet (responsive desktop) a la app CLB App Móvil.

**Architecture:** 
- PWA: service worker para cache estático y offline, manifest.json, workbox para estrategias de caché
- API: Node.js + Express con SQLite (desarrollo) / PostgreSQL (producción), autenticación JWT, endpoints REST para usuarios, electores, comités, padrón, incidencias, tareas, permisos
- Backoffice: SPA React separada o sección dentro de la app móvil, accesible solo a rol Admin, con gestión de usuarios, roles, permisos, electores, comités, reportes
- Web/Tablet: CSS media queries, layout adaptativo (sidebar en desktop, bottom-nav en móvil), breakpoints en 768px y 1024px

**Tech Stack:** React 19, Vite 8, Tailwind v3.4, react-router-dom 7, Express.js, SQLite (better-sqlite3 para dev), JWT, Workbox para PWA

**Spec:** No hay spec de diseño aún; las refs HTML existentes son para móvil. Se debe crear DESIGN.md para PWA/API/BACKOFFICE/WEB.

## Global Constraints

- Spanish UI copy
- Tailwind v3.4 (no v4)
- React 19, react-router-dom 7
- No dependencies nuevas pesadas; usar express para API (simple y rápido)
- localStorage como fallback si API no disponible (offline-first)
- Todos los tests existentes deben seguir pasando (132 tests)
- Build debe seguir pasando

## Review Focus

1. **PWA: service worker no cachea rutas de API dinámicas** - verificar que sw precache solo assets estáticos
2. **API: endpoint de login debe retornar token JWT y rol correcto** - verificar autenticación
3. **Backoffice: solo rol Admin puede acceder** - verificar guard de ruta
4. **Web/Tablet: bottom-nav se oculta en desktop, se muestra sidebar** - verificar media queries
5. **Offline: app funciona sin conexión usando localStorage + service worker** - verificar SW registra y sirve assets

---

### Task 1: PWA - Service Worker + Manifest.json

**Files:**
- Create: `clb-app/public/manifest.json`
- Create: `clb-app/src/sw.js`
- Create: `clb-app/src/registerSW.js`
- Modify: `clb-app/index.html` (agregar manifest link y registrar SW)
- Test: `clb-app/src/test/pwa.test.jsx`

**Interfaces:**
- Consumes: assets estáticos de Vite (index.html, JS, CSS, imágenes)
- Produces: service worker registrado, manifest disponible, app instalable como PWA

- [ ] **Step 1: Write failing test para PWA**

```javascript
it('service worker está registrado', async () => {
  // verificar que navigator.serviceWorker existe y está registrado
})
it('manifest.json existe y tiene name, start_url, display', async () => {
  // verificar contenido del manifest
})
```

- [ ] **Step 2: Run test para verificar que falla**
- [ ] **Step 3: Implementar manifest.json con nombre, icons, start_url, display: standalone**
- [ ] **Step 4: Implementar sw.js con precache de assets estáticos y estrategia cache-first para estáticos, network-first para API**
- [ ] **Step 5: RegisterSW y agregar a index.html**
- [ ] **Step 6: Run test y verificar PASS**
- [ ] **Step 7: Commit**

---

### Task 2: API - Express Backend con JWT Auth

**Files:**
- Create: `clb-api/package.json` (express, cors, helmet, dotenv, jsonwebtoken, bcryptjs, better-sqlite3)
- Create: `clb-api/server.js`
- Create: `clb-api/routes/auth.js` (login, register, logout)
- Create: `clb-api/routes/electores.js` (CRUD electores)
- Create: `clb-api/routes/comites.js` (CRUD comités)
- Create: `clb-api/routes/llamadas.js` (CRUD llamadas/col)
- Create: `clb-api/routes/usuarios.js` (CRUD usuarios, roles, permisos)
- Create: `clb-api/middleware/auth.js` (verificar JWT)
- Create: `clb-api/database/schema.sql` (tablas: users, electores, comites, llamadas, tareas, incidencias, permisos)
- Test: `clb-api/test/auth.test.js`, `clb-api/test/electores.test.js`

**Interfaces:**
- Consumes: JSON body con credenciales, datos de elector, etc.
- Produces: JWT token en header Authorization, datos JSON de electores/comités/etc.

- [ ] **Step 1: Write failing test para auth login/register**
- [ ] **Step 2: Run test para verificar falla**
- [ ] **Step 3: Implementar schema SQL (users, electores, comites, llamadas, tareas, incidencias, permisos)**
- [ ] **Step 4: Implementar middleware auth (verificar JWT)**
- [ ] **Step 5: Implementar rutas auth (login devuelve JWT, register crea usuario)**
- [ ] **Step 6: Implementar rutas electores (GET, POST, PUT, DELETE)**
- [ ] **Step 7: Implementar rutas comités (GET, POST, PUT, DELETE)**
- [ ] **Step 8: Run tests y verificar PASS**
- [ ] **Step 9: Commit**

---

### Task 3: Conectar Frontend con API (reemplazar localStorage por fetch)

**Files:**
- Modify: `clb-app/src/store/actions.js` (reemplazar localStorage con fetch a API)
- Modify: `clb-app/src/lib/storage.js` (agregar fallback a localStorage si API falla)
- Test: `clb-app/src/test/api.test.jsx`

**Interfaces:**
- Consumes: API endpoints de Task 2
- Produce: datos sincronizados con API, fallback a localStorage offline

- [ ] **Step 1: Write failing test para verificar que acciones usan API**
- [ ] **Step 2: Run test para verificar falla**
- [ ] **Step 3: Implementar acciones que llamen a API con fetch**
- [ ] **Step 4: Implementar fallback a localStorage si API no disponible (offline-first)**
- [ ] **Step 3: Run test y verificar PASS**
- [ ] **Step 4: Commit**

---

### Task 4: Backoffice - Panel de Administración (solo Admin)

**Files:**
- Create: `clb-app/src/pages/app/AdminPanel.jsx` (ya existe, refactorizar para ser completo)
- Create: `clb-app/src/pages/app/AdminUsers.jsx` (gestión de usuarios)
- Create: `clb-app/src/pages/app/AdminRoles.jsx` (gestión de roles y permisos)
- Create: `clb-app/src/pages/app/AdminElectores.jsx` (gestión de electores)
- Create: `clb-app/src/pages/app/AdminComites.jsx` (gestión de comités)
- Create: `clb-app/src/pages/app/AdminReportes.jsx` (reportes y estadísticas)
- Modify: `clb-app/src/routes.jsx` (agregar ruta /app/admin protegida por rol admin)
- Test: `clb-app/src/test/admin-panel.test.jsx` (actualizar)

**Interfaces:**
- Consumes: API endpoints de usuarios, roles, permisos, electores, comités
- Produce: UI para administrar usuarios, cambiar roles, asignar permisos, ver reportes

- [ ] **Step 1: Write failing test para AdminPanel (solo admin puede acceder)**
- [ ] **Step 2: Run test para verificar falla**
- [ ] **Step 3: Implementar AdminPanel con sidebar de navegación (Usuarios, Roles, Electores, Comités, Reportes)**
- [ ] **Step 4: Implementar gestión de usuarios (crear, editar, eliminar, cambiar rol)**
- [ ] **Step 5: Implementar gestión de permisos (asignar módulos a roles)**
- [ ] **Step 6: Implementar gestión de electores (ver todos, filtrar, editar)**
- [ ] **Step 7: Implementar gestión de comités (ver todos, editar)**
- [ ] **Step 8: Implementar reportes (estadísticas de fidelización, llamadas, incidencias)**
- [ ] **Step 9: Run test y verificar PASS**
- [ ] **Step 10: Commit**

---

### Task 5: Versión Web y Tablet (Responsive)

**Files:**
- Modify: `clb-app/src/components/AppLayout.jsx` (agregar sidebar para desktop, ocultar BottomNav en desktop)
- Modify: `clb-app/src/components/BottomNav.jsx` (ocultar en desktop)
- Create: `clb-app/src/components/Sidebar.jsx` (sidebar de navegación para desktop/tablet)
- Modify: `clb-app/src/pages/app/*.jsx` (ajustar layouts para desktop/tablet)
- Modify: `clb-app/tailwind.config.js` (agregar breakpoints si es necesario)
- Test: `clb-app/src/test/responsive.test.jsx`

**Interfaces:**
- Consumes: estado de navegación actual
- Produce: layout adaptativo (sidebar en desktop, bottom-nav en móvil)

- [ ] **Step 1: Write failing test para responsive (ocultar BottomNav en desktop)**
- [ ] **Step 2: Run test para verificar falla**
- [ ] **Step 3: Implementar Sidebar component para desktop/tablet**
- [ ] **Step 4: Modificar AppLayout para usar Sidebar en desktop y BottomNav en móvil**
- [ ] **Step 5: Ajustar páginas app para desktop (grid más amplio, menú lateral)**
- [ ] **Step 6: Run test y verificar PASS**
- [ ] **Step 7: Commit**

---

### Task 6: PWA Offline - Servicio de sincronización

**Files:**
- Modify: `clb-app/src/store/actions.js` (agregar cola de sincronización offline)
- Modify: `clb-app/src/sw.js` (agregar estrategia de sincronización en segundo plano)
- Test: `clb-app/src/test/pwa-offline.test.jsx`

**Interfaces:**
- Consumes: acciones pendientes en localStorage
- Produce: sincronización con API cuando se recupera conexión

- [ ] **Step 1: Write failing test para sincronización offline**
- [ ] **Step 2: Run test para verificar falla**
- [ ] **Step 3: Implementar cola de acciones pendientes en localStorage**
- [ ] **Step 4: Implementar sincronización automática al recuperar conexión**
- [ ] **Step 5: Run test y verificar PASS**
- [ ] **Step 6: Commit**

---

### Task 7: Verificación Final y Commit

**Files:**
- Modify: `clb-app/package.json` (agregar dependencias de producción si es necesario)
- Test: `npm.cmd run test`, `npm.cmd run build`, `node scripts/e2e.mjs`

**Interfaces:**
- Consumes: todo el código anterior
- Produce: aplicación completa lista para producción

- [ ] **Step 1: Run suite completa de tests (132+ tests)**
- [ ] **Step 2: Run build (exit 0)**
- [ ] **Step 3: Run e2e Playwright (26 pasos sin fallos)**
- [ ] **Step 4: Commit final**
- [ ] **Step 5: Documentar en progress.md**

---

## Self-Review

1. **Spec coverage:** Cada requisito (PWA, API, Backoffice, Web/Tablet) tiene tareas dedicadas.
2. **Step scan:** Cada paso es una acción única y verificable.
3. **Type consistency:** Las interfaces entre API y frontend usan JSON consistente.
4. **Review Focus:** Las 5 áreas críticas (PWA service worker, API auth, Admin guard, Web tablet layout, Offline sync) tienen tests dedicados.
5. **Proportion:** Plan es proporcional al alcance (7 tareas para 4 features grandes).

---

**Plan completo y guardado en `docs/superpowers/plans/2026-11-04-clb-rbac-pwa-api-backoffice-web.md`. Por favor revisa el plan. ¿Cuál enfoque de ejecución prefieres?**

- **Subagent-driven** - Un subagente fresh implementa cada tarea y un revisor fresh lo chequea antes de la siguiente, luego un review completo de la rama al final. Más completo; cuesta un contexto fresco por tarea y por review.
- **Native** - Yo implemento cada tarea yo mismo en esta sesión, como se ha estado haciendo en este harness, luego un reviewer fresh chequea la rama completa al final. Más barato y rápido; sin review independiente hasta el final. Funciona bien con un modelo de sesión de nivel medio, ya que el plan lleva el diseño.

**Para este plan recomiendo Native**, porque las tareas están muy interconectadas (API necesita estar funcionando antes que el frontend la consuma, PWA depende del build, etc.) y el contexto de esta sesión ya conoce bien el códigobase. ¿Estás de acuerdo con Native execution?