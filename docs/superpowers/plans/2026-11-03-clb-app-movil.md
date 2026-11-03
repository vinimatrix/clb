# CLB App Móvil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar como SPA React (Vite + Tailwind) el flujo móvil de 19 pantallas del proyecto Stitch "CLB App Design System", con registro/OTP simulado, login, dashboard y 8 módulos territoriales, persistido en localStorage.

**Architecture:** SPA con `react-router-dom`; estado global en un único `AppContext` (reducer + persistencia automática a `localStorage` con claves `clb.*`); datos demo sembrados en `src/data/seed.js`; UI compuesta por componentes compartidos y páginas por pantalla de referencia. Los KPIs de campaña son contadores sembrados que se incrementan con acciones; los módulos personales se calculan de filas reales.

**Tech Stack:** React 18 + Vite 5 + Tailwind CSS **v3.4** + react-router-dom 6 + Vitest + @testing-library/react (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-03-clb-app-movil-design.md` (leer junto con este plan; las 19 referencias visuales viven en `stitch-reference/01…19-*.html`).

## Global Constraints

- **npm en este equipo se invoca como `npm.cmd`** (PowerShell bloquea `npm.ps1` por política de ejecución). Todos los comandos npm de este plan usan `npm.cmd`.
- Node v26.13.0, npm 11.20.0, git 2.54 disponibles; repo git se inicializa en `C:\Users\vm004458\Documents\clb` (raíz), la app vive en `clb-app/`.
- Tailwind **v3** (`tailwindcss@^3.4` + postcss + autoprefixer), NO v4: `tailwind.config.js` + `postcss.config.js` con `@tailwind base/components/utilities` en `src/index.css`.
- Tokens exactos en `tailwind.config.js` (extend):
  - `colors.clb`: `primary:'#0D47A1'`, `primaryDeep:'#003178'`, `navy:'#072252'`, `orange:'#F36F21'`, `orangeBright:'#FF7020'`, `orangeDeep:'#E05D0E'`, `surface:'#F7F9FC'`, `ink:'#191C1E'`, `muted:'#64748B'`, `outlineC:'#CBD5E1'`, `green:'#10B981'`, `amber:'#F59E0B'`, `red:'#EF4444'`, `blueLight:'#D9E2FF'`, `orangeLight:'#FFDBCC'`.
  - `fontFamily`: `display: ['Montserrat','sans-serif']`, `sans: ['Inter','sans-serif']`.
  - `borderRadius.card: '1rem'`; `boxShadow.card: '0 4px 16px -2px rgba(7,34,82,0.06)'`.
- `index.html`: Google Fonts Montserrat (600;700;800;900) + Inter (400;500;600;700) + Material Symbols Outlined; `<title>CLB App — Carmen Ligia Barceló</title>`; `<html lang="es">`.
- Números con agrupación estilo mocks: `formatNumber` usa `'en-US'` (245,678). Textos de UI en español.
- Claves localStorage con prefijo `clb.` (`clb.session`, `clb.users`, `clb.electores`, `clb.comites`, `clb.metricas`, `clb.tareas`, `clb.llamadas`, `clb.incidencias`, `clb.recinto`, `clb.registro`, `clb.otp`).
- Layout móvil: contenedor `max-w-[440px] mx-auto min-h-dvh bg-clb-surface`, padding inferior para bottom nav (`pb-20`), header fijo `h-16`.
- Sin enlaces muertos: todo botón navega, ejecuta acción del store o muestra Toast.
- Fidelidad visual: cada tarea de pantalla COPÍA la estructura/clases de su archivo `stitch-reference/*.html` (listado en la tarea), sustituyendo Tailwind CDN por clases compiladas y `material-symbols-outlined` por el componente `Icon`.
- Cuenta demo sembrada: cédula `402-1234567-8`, usuario `clbarcelo2026`, contraseña `ClbSegura2026@`, rol `Miembro`, nombres "Juan Pérez". La pantalla Login muestra la ayuda de credenciales demo.

## Review Focus

1. **Ruta `/app/*` sin sesión** → redirige a `/login` (nunca renderiza módulo). Test en Task 6.
2. **Registro con cédula existente** → error inline "Esta cédula ya está registrada. Inicia sesión.", no crea cuenta. Test en Task 7.
3. **OTP incorrecto** → borde rojo + mensaje, no avanza; OTP correcto avanza. Test en Task 8.
4. **Login con credenciales inválidas** → error inline, sin sesión; correctas → `/validando` → `/app`. Test en Task 9.
5. **Persistencia tras recarga** → sesión y datos sobreviven a `location.reload()` (hydrate desde `clb.*`). Test en Task 4.

---

### Task 1: Scaffold Vite + Tailwind v3 + Vitest + git

**Files:**
- Create: `clb-app/` (scaffold Vite react), `clb-app/tailwind.config.js`, `clb-app/postcss.config.js`, `clb-app/src/index.css`, `clb-app/index.html` (modificar), `clb-app/src/App.jsx`, `clb-app/src/pages/public/Portada.jsx` (stub), `.gitignore` (raíz), `vitest.config` (dentro de `vite.config.js`).

**Interfaces:**
- Produces: comando de test `npm.cmd run test` (vitest run, environment jsdom, globals); `npm.cmd run dev` (puerto 5173); `npm.cmd run build`. `App.jsx` monta `<Portada/>` por defecto (sin router aún). `tailwind.config.js` con tokens del bloque Global Constraints. `src/index.css` con `@tailwind` x3 + `body { @apply bg-clb-surface text-clb-ink font-sans antialiased; }`.

- [ ] **Step 1: git init + .gitignore en la raíz** — `git init` en `C:\Users\vm004458\Documents\clb`; `.gitignore` con `node_modules/`, `dist/`, `.DS_Store`.

- [ ] **Step 2: scaffold** — desde la raíz: `npm.cmd create vite@latest clb-app -- --template react`; luego en `clb-app`: `npm.cmd install` y `npm.cmd install react-router-dom` + `npm.cmd install -D tailwindcss@^3.4 postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`.

- [ ] **Step 3: configurar Tailwind/vitest/index.html** — crear `postcss.config.js`, `tailwind.config.js` (tokens exactos arriba), reemplazar `src/index.css`, editar `index.html` (lang es, fuentes, title, `<div id="root">`), `vite.config.js` con `test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.js' }`; crear `src/test/setup.js` con `import '@testing-library/jest-dom/vitest';`. Borrar `src/App.css` y assets de demo.

- [ ] **Step 4: stub de Portada + smoke test** — `src/pages/public/Portada.jsx` renderiza `<main data-testid="portada">` con `<h1>¡Trabajemos Juntos por un Mejor Futuro Para Todos!</h1>` y botones "¡Unirme al proyecto!" e "Iniciar sesión". Test `src/test/smoke.test.jsx`: renderiza `<App/>`, espera `screen.getByText(/Unirme al proyecto/i)`.

- [ ] **Step 5: verificar** — Run: `npm.cmd run test` → PASS (1 test). Run: `npm.cmd run build` → exit 0.

- [ ] **Step 6: commit** — `git add -A && git commit -m "chore: scaffold Vite+React+Tailwind v3 con Vitest y tokens CLB"`

### Task 2: lib — formato, storage, hash

**Files:**
- Create: `clb-app/src/lib/format.js`, `clb-app/src/lib/storage.js`, `clb-app/src/lib/hash.js`, `clb-app/src/test/format.test.js`, `clb-app/src/test/storage.test.js`, `clb-app/src/test/hash.test.js`.

**Interfaces:**
- Produces:
  - `maskCedula(input: string): string` — deja solo dígitos (máx 11) y formatea `402-1234567-8` (3-7-1 con guiones).
  - `digitsOnly(s: string, max = 11): string`.
  - `maskTelefono(input: string): string` — 10 dígitos → `829-450-8912` (3-3-4).
  - `formatNumber(n: number): string` — `'en-US'` (`245678` → `"245,678"`).
  - `iniciales(nombres: string, apellidos: string): string` — primeras letras de primer nombre + primer apellido, uppercase (`"Juan","Pérez"` → `"JP"`).
  - `maskCedulaOculta(cedula: string): string` — `"402-1234567-8"` → `"402-******7-8"` (3 primeros + `******` + dígito 10 + `-` + dígito 11).
  - `storage.load<T>(key: string, fallback: T): T` — lee `localStorage`, JSON.parse con try/catch, devuelve fallback si falta/corrupto.
  - `storage.save(key: string, value: unknown): void` — JSON.stringify.
  - `simpleHash(pw: string): string` — determinista (`"clb:" + btoa(unescape(encodeURIComponent(pw)))`), y `verifyPassword(pw, stored): boolean`.

- [ ] **Step 1: tests fallando** — `format.test.js`: `maskCedula("40212345678")` → `"402-1234567-8"`; `maskCedula("4021234")` → `"402-1234"`; `maskTelefono("8294508912")` → `"829-450-8912"`; `formatNumber(245678)` → `"245,678"`; `iniciales("Juan","Pérez")` → `"JP"`; `maskCedulaOculta("402-1234567-8")` → `"402-******7-8"`. `storage.test.js`: save/load roundtrip; corrupto → fallback; clave ausente → fallback. `hash.test.js`: `verifyPassword("ClbSegura2026@", simpleHash("ClbSegura2026@"))` true; password distinta false.

- [ ] **Step 2: run** — `npm.cmd run test` → FAIL (módulos no existen).

- [ ] **Step 3: implementar** — firmas exactas arriba; nada más.

- [ ] **Step 4: run** — `npm.cmd run test` → PASS.

- [ ] **Step 5: commit** — `git add -A && git commit -m "feat: utilidades de formato, storage y hash con tests"`

### Task 3: seed de datos demo

**Files:**
- Create: `clb-app/src/data/seed.js`, `clb-app/src/test/seed.test.js`.

**Interfaces:**
- Produces: `buildSeed(): { users, electores, comites, recinto, metricas, tareas, llamadas, incidencias }` — objeto plano serializable (sin ids derivados de Date.now salvo `crypto.randomUUID()`; fechas relativas calculadas con `Date.now()`).
  - `users`: demo `402-1234567-8` / `clbarcelo2026` / `simpleHash('ClbSegura2026@')` / rol `'Miembro'` / nombres `Juan` apellidos `Pérez` / telefono `829-450-8912`.
  - `recinto`: `{ nombre:'Liceo Secundario Bernardo Pichardo', codigo:'JCE-HM-0012', direccion:'Calle Duarte esq. San Antonio, Hato Mayor del Rey', coordinador:'Lic. Roberto Santana', coordinadorTel:'829-555-0142', meta:1850, fidelizados:1420, padronTotal:2980, delegados:'6 titulares / 6 suplentes' }`.
  - `recinto.colegios` (6): `A 0012A 512 260 'Ramón Mercedes' completa`, `B 0012B 495 245 'Carmen Díaz' completa`, `C 0012C 480 210 'José Almonte' falta-suplente`, `D 0012D 505 275 'Laura Peña' completa`, `E 0012E 498 230 'Miguel Vargas' completa`, `F 0012F 490 200 'Patricia Morales' completa` (campos: `letra, codigo, electores, fidelizados, delegado, estado`, % derivado `fidelizados/electores`).
  - `metricas`: `{ inscritos:245678, inscritosDelta:'+12%', cba:18430, cbaDelta:'+5%', cbe:12650, cbeDelta:'+0%', fidelizados:98320, fidelizadosDelta:'+16%', mercadoTotal:8873889, mercadoPrm:1273350, mercadoOtros:7600539, cobertura:{inscritos:27.7,cba:1.4,cbe:1.4,fidelizados:11.1}, metaSemanal:50, inscritosPorMiBase:0 }` — `inscritosPorMi` = electores con `registradoPor==='demo'` creados hoy (38 del seed) + base 0.
  - `electores` (44 filas, generadas: 38 con `registradoPor:'demo'` y `createdAt` de hoy; 6 históricos): distribuir estados para que `asignadoA:'demo'` cubra **36**: 28 `fidelizado`, 5 con tarea `llamada`, 3 con tarea `visita`, y además 5 `indeciso` asignados (los 5 indecisos cuentan dentro de los 36: 28+5+3 = 36 ✓). Usar nombres/cédulas de los mocks: `Rosa Esther Gómez Rosario 001-0982341-2 Barrio Ondina`, `Manuel Ramírez Santana 026-0045129-8`, `Yocasta Lorenzo Peña 001-1478523-9`, `Darío Castillo Mercedes 026-0091823-1`, `Marcos Aurelio Peguero 027-0038912-4`, `Dania Mercedes Rosario 001-0982341-2`, `José Ramón Castillo 027-0045129-8`, `Ramona Altagracia Santana 027-0019284-3`, `Mercedes Altagracia Peña 027-0019284-3`, `Carlos Manuel Rosario Díaz 027-0045129-8`, `Yessica Altagracia Mota 027-0028491-3`, `Carmen Rosa Altagracia Silvestre 027-0056192-0` (mesa 0012B, orden #140)… resto rellenado con combinaciones RD plausibles; recintos entre `Liceo Bernardo Pichardo`, `Escuela Juan Jiménez`, `Escuela Andrés Bello`, `Escuela Faustina Silva`; mesas `0012A…0012F`, `0018`, `0005`, `0014`, `0011`; `cba` entre `CBA-04 Ondina Sur|CBA-05 Las Malvinas|CBA-08 Bella Vista`.
  - `tareas`: derivadas de los 8 electores con pendiente (`{ id, electorId, tipo:'llamada'|'visita', vencimiento:'hoy', estado:'pendiente' }`) — 5 llamada + 3 visita.
  - `comites` (18 = 6 CBA + 12 CBE):
    - CBA detallados: `CBA-048 Familia Peña Mota` líder `Yessica A. Mota Peña` ced `027-0028491-3` sector `Las Malvinas` recinto `Liceo Bernardo Pichardo (Mesa 0041)` estado `blindado` votos `8/8` integrantes 8; `CBA-012 Familia Barceló HM` líder `Ramón Antonio Castillo` ced `027-0019284-8` sector `Barrio Ondina` recinto `Escuela Juan Jiménez (Mesa 0018)` estado `proceso` `5 seguros + 1 simpatizante` (85%); `CBA-091 Núcleo Sabana Sur` líder `Deyanira M. Silvestre` ced `027-0056192-0` sector `Sabana de la Mar` recinto `Escuela Andrés Bello` estado `prioridad` `4 seguros + 3 seguimiento` + alerta transporte. + 3 genéricos (`CBA-020`, `CBA-033`, `CBA-077`, `blindado`).
    - CBE: `CBE-014 Comité Pedro Santana` preside `Dr. Franklin Mercedes` ced `027-0019284-3` recinto `Liceo Bernardo Pichardo` mesa `0012A` padrón 450 delegados `Marcos Peña/Rosa Gómez` voto `58/60` estado `blindado`; `CBE-028 Comité Gregorio Luperón` preside `Lic. Mariana Sosa` ced `027-0044512-4` recinto `Escuela Juan Jiménez` mesa `0018` padrón 512 delegados `Yomaly Santana/Sin Designar` estado `falta-suplente`; `CBE-042 Comité Duarte Centro` preside `Edwin Rodríguez Peña` ced `027-0056192-0` recinto `Escuela Andrés Bello` mesa `0005` padrón 390 delegados `Carlos Rijo/Elena Peguero` voto `52/50` estado `blindado`. + 9 genéricos `blindado` (códigos `CBE-003…CBE-051`), mesas/padrones plausibles.
    - Resumen CBE derivable: `asignados:12`, `mesasCubiertas:'11/12'`.
  - `llamadas`: `{ metaDiaria:60, completadasHoy:42, ritmo:'+6/hora', votosSeguros:34, transporte:8, reintentos:18, cola:[ {id, nombre:'Manuel Antonio Castillo', motivo:'reintento', detalle:'No contestó 9:15 AM', recinto:'Escuela Faustina Silva'}, {id, nombre:'Clara Luz Berroa', motivo:'agendada', detalle:'11:30 AM', recinto:'Liceo Bernardo Pichardo (Mesa 0011)'}, {id, nombre:'José David Mercedes', motivo:'confirmar', detalle:'Simpatizante • Sector Las Malvinas', recinto:'Mesa 0014'} ] }`.
  - `incidencias`: `[]`.

- [ ] **Step 1: test fallando** — `seed.test.js` assertions: `users` tiene 1 con cedula demo; `electores.length === 44`; electores con `asignadoA==='demo'` === 36; de ellos `estado==='fidelizado'` === 28, `indeciso` === 5; `tareas.filter(t=>t.tipo==='llamada').length === 5` y `visita` === 3; `comites.filter(c=>c.tipo==='CBA').length === 6`; `=== 12` para CBE; `recinto.colegios.length === 6`; `recinto.colegios[0].codigo === '0012A'`; `metricas.inscritos === 245678`; `llamadas.completadasHoy === 42`; `JSON.parse(JSON.stringify(buildSeed()))` no lanza (serializable).

- [ ] **Step 2: run** — FAIL. **Step 3: implementar** (firmas/valores exactos arriba). **Step 4: run** — PASS.

- [ ] **Step 5: commit** — `git add -A && git commit -m "feat: semilla de datos demo fiel a los mocks"`

### Task 4: AppContext (store global + persistencia)

**Files:**
- Create: `clb-app/src/store/AppContext.jsx`, `clb-app/src/store/actions.js` (lógica pura, testeable), `clb-app/src/test/store.test.js`.

**Interfaces:**
- Consumes: Task 2 (`storage`, `simpleHash`, `maskCedula`), Task 3 (`buildSeed`).
- Produces:
  - `<AppProvider>` + `useApp()` → `{ state, actions }`.
  - `state`: `{ session|null, registro, otp, users, electores, comites, recinto, metricas, tareas, llamadas, incidencias }`.
  - `actions` (todas síncronas, devuelven resultado plano):
    - `iniciarRegistro(draft)` / `actualizarRegistro(patch)` / `limpiarRegistro()`
    - `generarOtp(): string` (5 dígitos, guarda en state.otp con `expiraEn: Date.now()+120000`)
    - `validarOtp(code: string): boolean`
    - `registrarCuenta({cedula, username, password, nombres, apellidos, telefono}): {ok:boolean, error?:string}` — errores: cédula duplicada → `'Esta cédula ya está registrada. Inicia sesión.'`; username <6 o tomado → `'Mínimo 6 caracteres'` / `'Usuario no disponible'`; valida password 5 reglas aquí NO (eso lo hace la UI); persiste en `users`.
    - `login(cedula, password): {ok, error?}` — error → `'Credenciales incorrectas'`; ok → session `{cedula, username, role, nombres}`.
    - `logout()`
    - `verificarCedula(cedula): {habilitado:true, datos}` — SIMULADOR JCE determinista: si la cédula existe en `electores` devuelve sus datos; si no, genera nombre/apellidos de pools fijos + recinto/mesa/orden derivados del hash de la cédula (siempre habilitado, `Circunscripción 01`).
    - `addElector(data): elector` — id `crypto.randomUUID()`; `registradoPor = session.username`; si `data.asignarA_mi !== false` → `asignadoA = session.username` + crea tarea si estado ≠ fidelizado; incrementa `metricas.inscritos` y `metricas.fidelizados` si `estado==='fidelizado'`; prepend a electores.
    - `tipificarElector(electorId, {intencion, transporte, bloque, nota})` — guarda `intento`, si `intencion==='voto-seguro'` y estado era simpatizante/indeciso → estado `fidelizado` + `metricas.fidelizados+1`; `llamadas.completadasHoy+1`; agrega a `llamadas.historial`.
    - `completarTarea(tareaId)` — estado `completada`.
    - `reportarIncidencia({colegio, texto})` — push con fecha.
    - `addComite(tipo, data)` — push con código generado (`CBA-`/`CBE-` + siguiente número).
    - `reconfirmarFidelizado(electorId)` — marca `reconfirmadoAt`.
    - `resetDemo()` — reemplaza todo el estado por `buildSeed()` (conservando users registrados) y limpia sesión.
  - Hidratación: al montar, carga cada clave `clb.*`; si `clb.users` no existe → siembra `buildSeed()` completo. Persistencia: `useEffect` guarda en cada cambio de slice.
- `actions.js` exporta reducers puros si conviene (p. ej. `addElectorReducer(state, data)`) — los tests van contra `AppContext` vía `renderHook` o contra actions.js puro. **Decisión: tests contra un helper puro `createStoreLogic(seedState)` en `actions.js`** que devuelve `{state, dispatch(action)}` igual al reducer real; AppContext solo lo envuelve en Context + persistencia. Así el test no necesita React.

- [ ] **Step 1: tests fallando** — `store.test.js`: (a) `registrarCuenta` duplicado demo → error exacto; (b) `registrarCuenta` ok añade a users; (c) `login` mal → `'Credenciales incorrectas'`; login demo bien → session con username `clbarcelo2026`; (d) `generarOtp` → 5 dígitos y `validarOtp(code)` true, `validarOtp('00000')` false; (e) `addElector` fidelizado → `electores.length+1`, `metricas.inscritos+1`, `metricas.fidelizados+1`, tarea no creada; `addElector` indeciso → crea tarea tipo `'visita'`? **NO**: tipo `'llamada'` para indeciso/simpatizante sin contacto, `'visita'` solo si `requiereVisita:true`; test: indeciso crea tarea `llamada`; (f) `tipificarElector` con `intencion:'voto-seguro'` sobre indeciso → estado `fidelizado` y `metricas.fidelizados+1`, `llamadas.completadasHoy+1`; (g) persistencia: tras ops, `storage.load('clb.electores')` refleja el cambio; (h) `resetDemo` restaura 44 electores.

- [ ] **Step 2: run** — FAIL. **Step 3: implementar** store logic + provider. **Step 4: run** — PASS.

- [ ] **Step 5: commit** — `git add -A && git commit -m "feat: store global con acciones de registro, auth, electores y persistencia clb.*"`

### Task 5: Componentes compartidos

**Files:**
- Create: `clb-app/src/components/`: `Icon.jsx`, `Button.jsx`, `Badge.jsx`, `MetricCard.jsx`, `ProgressBar.jsx`, `SearchBar.jsx`, `FilterPills.jsx`, `Avatar.jsx`, `Toast.jsx` (con `ToastProvider`+`useToast`), `AppHeader.jsx`, `BottomNav.jsx`, `StepBadge.jsx`, `DonutChart.jsx`, `ContactActions.jsx` (llamar/WhatsApp), `index.js` (barrel).
- Test: `clb-app/src/test/components.test.jsx`.

**Interfaces:**
- Consumes: nada del store (puros, props).
- Produces (props exactas):
  - `Icon({name, size=20, className})` → `<span className="material-symbols-outlined" style={{fontSize:size}}>{name}</span>`.
  - `Button({variant:'orange'|'blue'|'outline'|'ghost'|'green', size:'md'|'lg', full=true, children, ...props})` — orange `bg-clb-orange hover:bg-clb-orangeDeep`, blue `bg-clb-primary hover:bg-clb-primaryDeep`, `h-12 lg:h-[52px] rounded-[10px] text-white font-bold uppercase tracking-wide`.
  - `Badge({tone:'green'|'orange'|'blue'|'gray'|'red', children})` — pill `rounded-full px-2 py-0.5 text-[10px] font-bold`.
  - `MetricCard({icon, tone, value, label, sub, delta, deltaTone})`.
  - `ProgressBar({value:0-100, tone:'blue'|'orange'|'green', height='h-2'})`.
  - `SearchBar({placeholder, value, onChange, onClear})`.
  - `FilterPills({options:[{id,label,count?}], active, onChange})` — activo `bg-clb-primary text-white`.
  - `Avatar({text, size=40, tone='blue'})` círculo; `ToastProvider/useToast().show(msg, tone)`.
  - `AppHeader({title, subtitle, onBack, right})` — fijo `h-16`, botón back opcional, logo CLB (círculo azul + pulgar SVG inline + "CARMEN LIGIA BARCELÓ").
  - `BottomNav({items:[{path,icon,label}], activePath})` — fijo bottom `h-16` con 5 slots.
  - `StepBadge({paso, total=7, label})`; `DonutChart({percent, size=160, label})` SVG `stroke-dasharray` (como el mock: r=48, sw=12); `ContactActions({tel, waText, onBitacora?, onCompletar?})` — `tel:` y `https://wa.me/1{tel}` con texto encodeURIComponent.

- [ ] **Step 1: test** — render de `MetricCard`, `FilterPills` (click cambia active), `DonutChart` (percent 14.35 → atributo stroke-dasharray contiene `43.3`), `Toast` (`useToast().show('Hola')` muestra texto). Run FAIL → implementar → PASS.
- [ ] **Step 2: verificación visual** — `npm.cmd run dev`; crear ruta temporal `/dev-kit` en App.jsx listando todos los componentes; abrir `http://localhost:5173/dev-kit` y confirmar estilos (después de Task 6 se elimina).
- [ ] **Step 3: commit** — `git add -A && git commit -m "feat: biblioteca de componentes compartidos CLB"`

### Task 6: Router + guardas + Portada

**Files:**
- Modify: `clb-app/src/App.jsx`, `clb-app/src/main.jsx`.
- Create: `clb-app/src/routes.jsx` (tabla de rutas), `clb-app/src/components/RequireAuth.jsx`, `clb-app/src/pages/public/Portada.jsx` (reemplaza stub — referencia `stitch-reference/01-portada.html`).
- Test: `clb-app/src/test/guards.test.jsx`, `clb-app/src/test/portada.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`useApp` session), Task 5 (`Button`, `Icon`).
- Produces: rutas finales (todas las demás tareas solo crean el page-component y añaden SU entrada a `routes.jsx`):
  - Público: `/` Portada, `/registro` Paso2, `/registro/confirmacion` Paso3, `/registro/usuario` Paso4, `/registro/otp` Paso5, `/registro/contrasena` Paso6, `/registro/exito` Paso7, `/login`, `/validando`.
  - App (envueltas en `RequireAuth` + layout con BottomNav): `/app`, `/app/recinto`, `/app/padron`, `/app/inscripcion`, `/app/carpeta`, `/app/fidelizados`, `/app/cba`, `/app/cbe`, `/app/callcenter`, `/app/perfil`, `/app/mas`.
  - `RequireAuth`: sin `state.session` → `<Navigate to="/login" replace/>`.
  - Pages aún inexistentes → stub `Placeholder` con el nombre (se reemplazan en tareas siguientes; NINGÚN stub en `/app/*` muestra datos falsos).

- [ ] **Step 1: tests fallando** — `guards.test.jsx`: render de la app en memoria (MemoryRouter via App) con store sin sesión, navegar a `/app` → muestra texto de login (assert `screen.getByText(/Iniciar sesión/i)` en Portada tras redirect: usar `window.history` no; con MemoryRouter exponer `<AppRouter initialEntries(['/app'])>`); con sesión demo → `/app` renderiza stub "Dashboard". `portada.test.jsx`: Portada renderiza sello, badge "HATO MAYOR", slogan, y ambos botones navegan (click "Iniciar sesión" → ruta `/login`).
- [ ] **Step 2: run FAIL → implementar → PASS.**
- [ ] **Step 3: verificación visual** — dev server: `/` muestra hero azul degradado con dos botones naranjas (comparar con `stitch-reference/01-portada.html`).
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: router con guardas de sesión y portada de campaña"`

### Task 7: Registro — Pasos 2, 3 y 4

**Files:**
- Create: `clb-app/src/pages/public/Unirme.jsx` (ref `02-paso2-unirme.html`), `Confirmacion.jsx` (ref `03`), `CrearUsuario.jsx` (ref `04`).
- Test: `clb-app/src/test/registro123.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`actions.iniciarRegistro/actualizarRegistro/limpiarRegistro`, `state.users`), Task 2 (`maskCedula`, `maskTelefono`), Task 5 (`StepBadge`, `Button`, `AppHeader`, `Icon`).
- Produces: flujo `/registro` → `/registro/confirmacion` → `/registro/usuario` → navega a `/registro/otp`. Draft de registro persistido en `clb.registro`.
  - Unirme: campos cédula (mask en vivo), nombres, primer apellido, segundo (opcional), teléfono (mask). Submit con requeridos → si `users.some(cedula)` → error inline EXACTO "Esta cédula ya está registrada. Inicia sesión." con enlace a `/login`; ok → `iniciarRegistro(draft)` + navigate confirmacion. Enlace inferior "Iniciar sesión" → `/login`.
  - Confirmacion: check verde animado + tarjeta con `maskCedulaOculta(cedula)`, "Cédula Válida", "Identidad confirmada". Continuar → `/registro/usuario`.
  - CrearUsuario: badge dinámico según `username.length` y disponibilidad (toma `state.users`): `<6` → ámbar "Mínimo 6 caracteres"; ≥6 y libre → verde "Disponible" con check; tomado → rojo "Usuario no disponible". Continuar deshabilitado si no verde. Guarda en draft → `/registro/otp`.

- [ ] **Step 1: tests fallando** — (1) submit de Unirme vacío muestra mensajes de requerido y NO navega; (2) cédula `402-1234567-8` (demo) → error exacto de duplicado; (3) datos nuevos → llega a Confirmacion que muestra cédula enmascarada `402-******`; (4) username `clb` → badge "Mínimo 6 caracteres" y botón disabled; username `clbarcelo2026` → "Usuario no disponible"; `nuevo2026` → "Disponible" y habilita.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — recorrer los 3 pasos en dev; comparar con refs 02/03/04.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: pasos 2-4 del registro con validación de cédula y usuario"`

### Task 8: Registro — Pasos 5 (OTP), 6 (contraseña) y 7 (éxito)

**Files:**
- Create: `clb-app/src/pages/public/Otp.jsx` (ref `05-paso5-otp.html`), `Contrasena.jsx` (ref `06`), `Exito.jsx` (ref `07`).
- Test: `clb-app/src/test/registro4567.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`generarOtp`, `validarOtp`, `registrarCuenta`, draft), Task 5.
- Produces: al montar Otp sin `otp` activo → `generarOtp()`; chip "SMS de demostración: tu código es **{code}**" visible (así se prueba sin SMS). 5 inputs auto-avance/backspace/paste (lógica del script del mock, portada a React con refs). Reenviar: deshabilitado 60s con contador `(00:SS)` → "(Disponible)" y regenera. Error: borde rojo + "Código incorrecto, intenta de nuevo". Correcto → `/registro/contrasena`.
  - Contrasena: checklist en vivo de 5 reglas (`>=8`, mayúscula, minúscula, número, especial de `[^A-Za-z0-9]`), ojo toggle en ambos campos, CONTINUAR habilitado solo si 5 reglas + coincidencia; mismatch → error "Las contraseñas no coinciden". Submit → `registrarCuenta(draft+password)`; si ok `limpiarRegistro()` + navigate `/registro/exito`.
  - Exito: tarjeta con `iniciales`, `@{username}`, badge "Activo", "Rol: Miembro"; botón → `/login`.

- [ ] **Step 1: tests fallando** — (1) Otp muestra el código generado en el chip; escribir código incorrecto → mensaje de error; escribir el correcto (paste en caja 1) → navigate a contrasena; (2) Contrasena: `"Clb"` deja 3 reglas en gris y botón disabled; `"ClbSegura2026@"` enciende 5 y habilita; contraseñas distintas → error de coincidencia; (3) flujo completo registro nuevo termina en Exito mostrando `@{username}` y la cuenta existe en `clb.users`.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — recorrer pasos 5-7; comparar con refs 05/06/07.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: OTP simulado con temporizador, contraseña con checklist y cuenta creada"`

### Task 9: Login + Validando (Paso 9)

**Files:**
- Create: `clb-app/src/pages/public/Login.jsx` (ref `08-paso8-login.html`), `Validando.jsx` (ref `09-paso9-validacion.html`).
- Test: `clb-app/src/test/login.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`login`, session), Task 5, Task 2 (`maskCedula`).
- Produces: Login con máscara de cédula, ojo, ayuda demo fija: "Demo: 402-1234567-8 / ClbSegura2026@"; "¿Olvidaste tu contraseña?" → toast "Disponible en la versión con backend"; tarjeta "Crear una cuenta" → `/registro`. Submit ok → `navigate('/validando')`. Validando: checklist de 4 pasos que se marca secuencialmente (setInterval 900ms, ítem actual escala) + barra 45→70→88→100%; al completar → `/app`. Si ya hay sesión al montar Login → redirect `/app`.

- [ ] **Step 1: tests fallando** — (1) credenciales malas → error inline "Credenciales incorrectas" y sigue en /login; (2) demo correctas → tras avanzar, session en store y ruta `/app` (fake timers para Validando: `vi.useFakeTimers()` + advance 4000ms); (3) ayuda demo visible.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con refs 08/09.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: login con credenciales demo y validación de acceso animada"`

### Task 10: Layout App + Dashboard

**Files:**
- Create: `clb-app/src/pages/app/Dashboard.jsx` (fusión refs `10-dashboard-movil.html` + `11-dashboard-movil-v2.html`), `clb-app/src/components/AppLayout.jsx` (header + Outlet + BottomNav 5 tabs: Inicio `/app`, Inscripción `/app/inscripcion`, Recinto `/app/recinto`, Mi Carpeta `/app/carpeta`, Más `/app/mas`).
- Test: `clb-app/src/test/dashboard.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`state.metricas`, session), Task 5 (`MetricCard`, `DonutChart`, `ProgressBar`), Task 6 (rutas).
- Produces: Dashboard renderiza saludo `¡Hola, {session.nombres}!`, badge "Territorio Activo", hero campaña, 4 MetricCards con `formatNumber(metricas.inscritos)` → **"245,678"**, CBA **"18,430"**, CBE **"12,650"**, Fidelizados **"98,320"** con sus deltas; DonutChart 14.35% + desglose (Total 8,873,889 / PRM 1,273,350 / Otros 7,600,539); "Cobertura de Gestión" con las 4 barras (27.7/1.4/1.4/11.1); accesos rápidos (Inscripción, Mi Recinto, Mi Carpeta) navegan; notificaciones → toast "Sin notificaciones nuevas".

- [ ] **Step 1: tests fallando** — con sesión demo y seed: textos "245,678", "18,430", "12,650", "98,320", "14.35%", "8,873,889", "¡Hola, Juan Pérez!"; click en acceso "Inscripción" navega a `/app/inscripcion`.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con refs 10/11.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: layout de app con bottom nav y dashboard ejecutivo con KPIs vivos"`

### Task 11: Mi Recinto + Padrón de Recinto

**Files:**
- Create: `clb-app/src/pages/app/MiRecinto.jsx` (ref `12-mi-recinto.html`), `Padron.jsx` (ref `13-padron.html`).
- Test: `clb-app/src/test/recinto.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`state.recinto`, `state.electores`, `reportarIncidencia`), Task 5.
- Produces: Recinto — hero con datos del recinto + botón llamar (`tel:`), meta 1,850 / fidelizados 1,420 / barra 76% participación (value = fidelizados/meta ≈76.7), 4 metric cards (6 colegios, 2,980 padrón, 1,420 fidelizados 47.6%, delegados 100%), tabs Mesas/Equipo/Incidencias (Mesas por defecto; Equipo lista delegados de colegios; Incidencias lista `state.incidencias` con form mini), lista de 6 colegios con % calculado y badge estado, botones "Ver Padrón de Recinto (2,980)" → `/app/padron` y "Reportar Novedad de Mesa" → abre sheet con select de colegio + textarea → `reportarIncidencia` + toast.
  - Padrón — búsqueda por nombre/cédula en vivo, FilterPills por estado (Todos/Fidelizados/Simpatizantes/Indecisos), lista de filas elector (avatar iniciales, nombre, cédula, recinto·mesa, badge estado), acción por fila "Fidelizar" (solo simpatizante/indeciso → tipificación rápida con intención voto-seguro) y enlace WhatsApp; contador resultados.

- [ ] **Step 1: tests fallando** — Recinto: textos "Liceo Secundario Bernardo Pichardo", "1,850", "2,980", "1,420", "47.6%"; 6 tarjetas de colegio; tab Incidencias muestra vacío → reportar una → aparece. Padrón: buscar "Rosa" filtra a 1 fila (Rosa Esther); pill "Fidelizados" filtra; acción Fidelizar sobre un indeciso incrementa `metricas.fidelizados`.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con refs 12/13.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: mi recinto con colegios e incidencias y padrón con búsqueda y fidelización rápida"`

### Task 12: Inscripción de Electores

**Files:**
- Create: `clb-app/src/pages/app/Inscripcion.jsx` (ref `14-inscripcion.html`).
- Test: `clb-app/src/test/inscripcion.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`verificarCedula`, `addElector`, `state.metricas`, electores de hoy), Task 2 (`maskCedula`, `maskTelefono`), Task 5.
- Produces: tarjeta meta semanal (`{inscritosHoy} / 50` con % — inscritosHoy = electores con `registradoPor===session.username` y `createdAt` hoy; seed demo = 38 → "38 / 50 electores", "76% completado", "Faltan 12 para bono"); botón "Escanear Cédula con Cámara" → simula OCR: tras 600ms carga cédula generada + `verificarCedula`; formulario paso 1 (cédula + Verificar → tarjeta "Elector Habilitado JCE" con recinto/mesa/orden + grid autocompletado), paso 2 (teléfono, WhatsApp checkbox, alt, sector, calle, referencia), paso 3 (chips de fidelización single-select, select CBA y célula, toggle movilización), botón "Registrar e Inscribir Elector" → `addElector` + toast "¡Elector inscrito exitosamente!" + reset del form + aparece en "Inscritos Recientemente Hoy" (con acción WhatsApp `wa.me`).

- [ ] **Step 1: tests fallando** — (1) meta muestra "38" y "76%"; (2) Verificar con cédula nueva puebla tarjeta JCE y grid de datos; (3) completar flujo mínimo + submit → `state.electores.length+1`, `metricas.inscritos+1`, toast visible, nuevo elector en "Inscritos Recientemente"; (4) chips: elegir "Simpatizante" deselecciona "Fidelizado".
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con ref 14.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: inscripción de electores con verificación JCE simulada y alta al padrón"`

### Task 13: Mi Carpeta + Perfil + Más

**Files:**
- Create: `clb-app/src/pages/app/MiCarpeta.jsx` (ref `15-mi-carpeta.html`), `Perfil.jsx`, `Mas.jsx`.
- Test: `clb-app/src/test/carpeta.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`state.tareas`, electores asignados, `completarTarea`, `logout`, `resetDemo`), Task 5 (`SearchBar`, `FilterPills`, `ContactActions`).
- Produces: MiCarpeta — hero dirigente con meta `{asignados con estado fidelizado} / {total asignados}` (demo: 28/36 → "78%"), 3 métricas (contactos 36, voto seguro 28 "77.8%", pendientes 8 "5 Llam • 3 Vis" calculadas), botones: "+ Agregar Elector" → `/app/inscripcion`; "Llamadas Hoy" y "Ruta de Visitas" hacen scroll+pre-filtro; búsqueda filtra por nombre/cédula; pills Todos(36)/Por Llamar(5)/Visita Pendiente(3)/Voto Seguro(28)/Indecisos(5) filtran tarjetas; cada tarjeta: datos elector, badge estado, "Completar" → `completarTarea` (badge cambia a "¡Lista!" verde), ContactActions con `tel:`/`wa.me`; widget inferior "N llamadas restantes" + "Difusión" → toast.
  - Perfil — datos de sesión (avatar iniciales, username, cédula, rol), resumen de actividad (inscritos por mí hoy, tareas completadas), botones "Restablecer datos demo" (confirm + `resetDemo` + toast) y "Cerrar sesión" → `logout()` + navigate `/`.
  - Más — grilla de accesos: Fidelizados, CBA, CBE, Call Center, Perfil (+ volver a Inicio). Ningún elemento muerto.

- [ ] **Step 1: tests fallando** — (1) métricas "36", "28", "8", "78%"; (2) pill "Por Llamar" → 5 tarjetas; (3) Completar una tarea → desaparece de Por Llamar (queda 4); (4) búsqueda "Marcos" → 1 tarjeta (Marcos Aurelio Peguero); (5) "Difusión" muestra toast; (6) Perfil "Cerrar sesión" → ruta `/` y sin sesión.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con ref 15.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: mi carpeta con tareas y filtros, perfil con logout y centro Más"`

### Task 14: Fidelizados + CBA + CBE

**Files:**
- Create: `clb-app/src/pages/app/Fidelizados.jsx` (ref `16-fidelizados.html`), `Cba.jsx` (ref `17`), `Cbe.jsx` (ref `18`).
- Test: `clb-app/src/test/fidelizados.test.jsx`, `clb-app/src/test/comites.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`state.metricas`, electores, comites, `reconfirmarFidelizado`, `addComite`), Task 5.
- Produces:
  - Fidelizados — banner "Red de Fidelizados CLB" + "Día D: -18 días" (fecha fija demo 2026-11-24); métricas: Total `formatNumber(metricas.fidelizados)` con meta `formatNumber(1800)` y % (78.9% sembrado en `metricas.metaFidelizadosCirc:{actual:1420, meta:1800}` — **nota**: la red de la circunscripción usa el contador `metricas.fidelizadosCirc` sembrado en 1420, se incrementa con fidelizaciones), Voto Seguro 1,150 (`metricas.votoSeguroCirc`), Por Revalidar 270 (`metricas.porRevalidarCirc`); "+ Registrar Fidelizado" → `/app/inscripcion`; pills de segmento + búsqueda filtran tarjetas de electores fidelizados/simpatizantes; botón "Reconfirmar Voto" → `reconfirmarFidelizado` + toast; estos 3 contadores nuevos se agregan a `metricas` en Task 3 seed (`fidelizadosCirc:1420, votoSeguroCirc:1150, porRevalidarCirc:270, metaFidelizadosCirc:1800`).
  - CBA — hero (6 CBA, 82% asegurado, 48 electores), KPIs (39 voto seguro, 09 por visitar), "+ Crear Nuevo CBA" → sheet con (nombre familia, líder, cédula, sector, recinto/mesa) → `addComite('CBA', data)` + toast; chips Todos(6)/100%/En Proceso/Prioridad + búsqueda filtran tarjetas; acciones: llamar/WhatsApp líder, "Ver Integrantes" → sheet con lista, "Revalidar Simpatizante" → toast, "Completar Auditoría" → toast.
  - CBE — cinta tricolor, cobertura 92% (11/12), KPIs (22/24 delegados "91.6%", 640 voto duro "85.3%"), "+ Crear Nuevo Comité CBE" (sheet igual) → `addComite('CBE', data)`; chips Todos(12)/Blindados(9)/Falta Suplente(2)/Por Validar(1); tarjetas con presidente, delegados titular/suplente (suplente "Sin Designar" en rojo), barra voto comprometido, "Asignar Suplente" (en falta-suplente) → prompt sheet con nombre → actualiza delegados + estado blindado; taller de acreditación con botón WhatsApp (enlace `wa.me`).

- [ ] **Step 1: tests fallando** — Fidelizados: "1,420", "1,800", "78.9%", "Día D: -18 días"; Reconfirmar → toast. CBA: "6 CBA" (contador del hero), 3+3 tarjetas, crear CBA nuevo → cuenta 7 y aparece. CBE: "22/24" (texto `22` y `/24`), tarjeta CBE-028 muestra "Sin Designar" y "Falta Suplente"; Asignar Suplente con nombre "Luis Pérez" → suplente cambia y badge pasa a blindado; crear CBE → 13.
- [ ] **Step 2: FAIL → implementar → PASS.** (agregar los 3 contadores al seed de Task 3 en este punto si no se hicieron allí; el seed test ya debe contemplarlos: añadir assertions `metricas.fidelizadosCirc===1420` etc. en Task 3).
- [ ] **Step 3: visual** — comparar con refs 16/17/18.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: módulos de fidelizados y comités CBA/CBE con creación y acciones"`

### Task 15: Call Center

**Files:**
- Create: `clb-app/src/pages/app/CallCenter.jsx` (ref `19-callcenter.html`).
- Test: `clb-app/src/test/callcenter.test.jsx`.

**Interfaces:**
- Consumes: Task 4 (`state.llamadas`, `tipificarElector`, cola), Task 5.
- Produces: hero "Tele-Validación Electoral" con cuota `{completadasHoy} / 60 (70%)` (42/60 del seed) + barra + "18 restantes" calculado; 3 métricas bento (votos seguros 34, transporte 8, reintentos 18); "Iniciar Siguiente Asignada" → toma el primer elector de la cola (o el elector con `intento` vacío) y muestra dossier (datos, recinto/mesa, guion colapsable, botones llamar/WhatsApp); formulario de tipificación: intención (4 chips single-select), transporte (3 chips), horario (3 chips), nota; "Guardar y Pasar al Siguiente" → `tipificarElector` + toast "Contacto tipificado con éxito. Cargando siguiente..." + cuota+1 + siguiente ficha; sin más fichas → estado "Cuota completada" con resumen. Cola prioritaria debajo con las 3 tarjetas del seed y botones de acción (llamar / avanza ficha).

- [ ] **Step 1: tests fallando** — (1) "42" y "60 (70%)" visibles; (2) "Iniciar Siguiente Asignada" muestra dossier con "Carmen Rosa Altagracia Silvestre" (primer elector con intento vacío del seed; asegurar en seed que ese elector sea el primero sin intento); (3) tipificar (intención voto-seguro + transporte + mañana) y Guardar → toast, `llamadas.completadasHoy===43`, dossier pasa al siguiente; (4) chips single-select funcionan.
- [ ] **Step 2: FAIL → implementar → PASS.**
- [ ] **Step 3: visual** — comparar con ref 19.
- [ ] **Step 4: commit** — `git add -A && git commit -m "feat: call center con cuota, dossier, tipificación y cola prioritaria"`

### Task 16: Verificación final y pulido

**Files:**
- Modify: solo lo que la verificación revele.

**Interfaces:**
- Consumes: todo lo anterior.

- [ ] **Step 1: suite completa** — `npm.cmd run test` → todos PASS; `npm.cmd run build` → exit 0.
- [ ] **Step 2: recorrido manual completo (dev server)** — flujo e2e en navegador: Portada → registro nuevo completo (cédula nueva, usuario, OTP del chip, contraseña) → Exito → Login (nueva cuenta) → Validando → Dashboard → Inscripción (registrar elector, verificar que sube KPI) → Recinto (reportar incidencia) → Padrón (fidelizar) → Mi Carpeta (completar tarea) → Fidelizados (reconfirmar) → CBA y CBE (crear comité) → Call Center (tipificar 2 fichas) → Perfil → Cerrar sesión → Login con demo. Comprobar `location.reload()` conserva sesión y datos.
- [ ] **Step 3: checklist visual** — para cada pantalla, abrir su ref `stitch-reference/NN-*.html` en el navegador lado a lado y corregir desviaciones evidentes (colores, jerarquía, radios, iconos).
- [ ] **Step 4: pulido** — quitar `/dev-kit` si quedó, console.log, accesibilidad mínima (aria-labels en botones icono, labels en inputs).
- [ ] **Step 5: commit final** — `git add -A && git commit -m "feat: verificación final del flujo móvil CLB"`

## Self-Review

- **Spec coverage:** onboarding 10 pasos (Tasks 6-9), dashboard (10), 8 módulos + Perfil/Más (11-15), modelo de datos (3-4), navegación/guardas (6), sin enlaces muertos (Toast en cada acción no navegable), cuenta demo (3/9), reset demo (13). Pantalla "Validación de Acceso" (paso 9) en Task 9. Dona/cobertura (10). ✓
- **Step scan:** cada step es una acción única con comando o firma concreta; los cuerpos de UI se guían por las refs HTML (no se transcriben en el plan). ✓
- **Type consistency:** `maskCedula/maskTelefono/formatNumber/iniciales/maskCedulaOculta` (T2) usados en T7/8/9/12; `useApp().actions.{iniciarRegistro, generarOtp, validarOtp, registrarCuenta, login, logout, verificarCedula, addElector, tipificarElector, completarTarea, reportarIncidencia, addComite, reconfirmarFidelizado, resetDemo}` (T4) usados igual en T7-15; rutas de T6 coinciden con BottomNav de T10 y accesos de T13/14. ✓ (corregido en redacción: `registradoPor` — el builder check lo escribió `registradoPer`, ya normalizado.)
- **Review Focus:** cada modo tiene test en su tarea (guards T6, duplicado T7, OTP T8, login T9, persistencia T4). ✓
- **Proportion:** 16 tareas, ~1.5× la extensión del spec; sin transcript de código de UI (las refs HTML llevan el detalle visual). ✓
