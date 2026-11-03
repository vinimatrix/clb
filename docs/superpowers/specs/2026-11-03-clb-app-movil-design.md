# Diseño: CLB App — Plataforma Móvil de Movilización y Acción Cívica

Fecha: 2026-11-03
Proyecto Stitch de referencia: https://stitch.withgoogle.com/projects/2693330986699197974
Referencias HTML: `stitch-reference/01…19-*.html` (19 pantallas del flujo móvil)

## 1. Intención y por qué

Implementar como aplicación web real el flujo móvil diseñado en Stitch para la campaña
de Carmen Ligia Barceló (Hato Mayor, RD): registro de miembros con validación SMS/OTP,
login, dashboard ejecutivo y los módulos territoriales (Mi Recinto, Padrón, Inscripción,
Mi Carpeta, Fidelizados, CBA, CBE, Call Center). La app debe verse y comportarse como las
imágenes de Stitch: mismo design system, mismas pantallas, y funcionalidad real de la que
las imágenes sugieren (formularios validados, navegación, datos que se crean y persisten).

Éxito = un usuario puede: registrarse paso a paso, iniciar sesión, ver su dashboard,
inscribir electores, gestionar su carpeta/comités y registrar llamadas — todo persistente
en su navegador, sin servidor.

## 2. Decisiones tomadas (por el usuario)

- **Stack**: React + Vite + Tailwind CSS. SPA cliente.
- **Datos**: demo + `localStorage`. Sin backend. El OTP es simulado; no se envía SMS real.
- **Alcance v1**: flujo móvil completo (las 19 pantallas de `stitch-reference/`).
  Las variantes Desktop/Tablet del proyecto Stitch quedan para una fase posterior.

## 3. Decisiones del implementador (marcadas como mías)

- **Enrutado**: `react-router-dom` (BrowserRouter). Rutas:
  - Público: `/` (Portada), `/registro` (Paso 2), `/registro/confirmacion` (3),
    `/registro/usuario` (4), `/registro/otp` (5), `/registro/contrasena` (6),
    `/registro/exito` (7), `/login` (8), `/validando` (9).
  - App (protegidas): `/app` (Dashboard), `/app/recinto`, `/app/padron`, `/app/inscripcion`,
    `/app/carpeta`, `/app/fidelizados`, `/app/cba`, `/app/cbe`, `/app/callcenter`.
  - Guarda de sesión: sin `session` en storage, las rutas `/app/*` redirigen a `/login`.
- **Estado**: React Context único (`AppProvider`) + reductores, con persistencia
  automática a `localStorage` (claves `clb.*`). Sin librerías de estado externas.
- **Identidad visual**: tokens de Tailwind tomados del design system de Stitch
  (azul primario `#0D47A1`/`#003178`, naranja `#F36F21`/`#FF7020`, navy `#072252`,
  superficies `#F7F9FC`, radios 8–16px, Montserrat para titulares/métricas, Inter para UI).
  Los mocks usan variantes ligeramente distintas de estos hex; se normaliza a un solo set
  de tokens con los valores del design system oficial y se mantiene la jerarquía visual.
- **Iconografía**: Material Symbols Outlined (Google Fonts), como en los mocks.
- **Layout**: contenedor móvil centrado `max-w-[440px]` a pantalla completa en móvil;
  en escritorio se centra sobre fondo neutro (como los propios mocks).
- **Cuenta demo sembrada**: al primer arranque se siembran datos demo y una cuenta
  `402-1234567-8` / usuario `clbarcelo2026` / contraseña `ClbSegura2026@`. La pantalla de
  login muestra una línea de ayuda con estas credenciales (mi decisión, para poder entrar
  sin registrarse).
- **OTP simulado**: al llegar al Paso 5 se genera un código de 5 dígitos y se muestra en
  un aviso tipo "SMS" en pantalla (chip informativo), con opción de reenviar (regenera).
  Se acepta solo ese código. (Mi decisión: hace la demo usable sin backend.)
- **Imágenes**: los retratos/candidata de los mocks son URLs de Google; se reemplazan por
  avatares con iniciales y un placeholder gráfico local (SVG/CSS) para no depender de
  enlaces que caducan. El logo es CSS/SVG (círculo azul + pulgar arriba).
- **Navegación inferior**: los mocks varían (3, 4 y 5 pestañas según pantalla). Se
  normaliza a 5 pestañas fijas: Inicio, Inscripción, Recinto, Mi Carpeta, Más (con
  accesos a Fidelizados/CBA/CBE/Call Center/Perfil) — coherente con el design system
  ("4-tab rail" del DESIGN.md + módulo CBA destacado).

## 4. Funcionalidad por pantalla (lo que las imágenes sugieren)

### Onboarding y acceso
1. **Portada** (`01`): hero de campaña, botones "¡Unirme al proyecto!" → `/registro`,
   "Iniciar sesión" → `/login`.
2. **Paso 2 — Unirme al Proyecto** (`02`): formulario cédula (11 dígitos, formateo
   automático `402-1234567-8`), nombre, primer apellido, segundo apellido (opcional),
   teléfono DO. Validación de requeridos y formato; CONTINUAR guarda el borrador del
   registro en memoria/storage. Enlace "¿Ya tienes cuenta?" → `/login`.
3. **Paso 3 — Confirmación** (`03`): pantalla de éxito con check animado y tarjeta
   "Verificación Padrón: Cédula Válida / Identidad confirmada" mostrando la cédula
   enmascarada (`402-*****{últimos}-X`). CONTINUAR → Paso 4.
4. **Paso 4 — Crear Usuario** (`04`): input username con badge dinámico
   ("Mínimo 6 caracteres" ámbar / "Disponible" verde ≥6 y no existente en storage).
   Reglas visibles. CONTINUAR valida y avanza.
5. **Paso 5 — Validación SMS/OTP** (`05`): 5 cajas con auto-avance, backspace, paste
   completo; temporizador de reenvío 60s que muestra "(Disponible)"; el código demo se
   muestra en un chip tipo SMS. Error: borde rojo + mensaje. CONTINUAR → Paso 6.
6. **Paso 6 — Crear Contraseña** (`06`): dos campos con toggle ojo y checklist de 5
   reglas que se encienden en verde en vivo (8+, mayúscula, minúscula, número, especial).
   CONTINUAR habilitado solo con todo verde y coincidencia.
7. **Paso 7 — Cuenta Creada** (`07`): confirmación con tarjeta del usuario creado
   (iniciales, @username, badge Activo, Rol: Miembro). "IR A INICIAR SESIÓN" → `/login`.
   Aquí se persiste la cuenta nueva (usuarios de localStorage).
8. **Paso 8 — Iniciar Sesión** (`08`): cédula con máscara y botón escáner (no funcional
   en demo, muestra toast), contraseña con ojo, "¿Olvidaste tu contraseña?" (toast de
   demo), botón primario naranja, divisor "O regístrate" → tarjeta "Crear una cuenta" →
   `/registro`. Al enviar: valida contra cuentas; error inline si no coincide.
9. **Paso 9 — Validación de Acceso** (`09`): animación de progreso con checklist
   secuencial (Verificando usuario / Validando contraseña / Identificando rol / Cargando
   permisos); al completar (≈4s) navega a `/app`.

### App principal
10. **Dashboard** (`10`+`11` fusionadas): saludo con el usuario logueado, badge "Territorio
    Activo", hero de campaña, KPIs 2×2 (Inscritos, CBA, CBE, Fidelizados) **calculados del
    store** con deltas, panel "Mercado Electoral" (dona SVG + desglose Total/PRM/Otros),
    panel "Cobertura de Gestión" (barras por métrica vs meta), accesos rápidos a módulos,
    bottom nav.
11. **Mi Recinto** (`12`): hero del recinto (Liceo Bernardo Pichardo, código JCE,
    coordinador, botón llamar `tel:`), meta 1,850 votos con barra (fidelizados/total),
    4 tarjetas métricas (Colegios 6, Padrón 2,980, Fidelizados con %, Delegados 100%),
    tabs Mesas/Equipo/Incidencias, lista de 6 colegios con progreso y delegado asignado,
    botones "Ver Padrón de Recinto" → `/app/padron` y "Reportar Novedad" (guarda
    incidencia en store).
12. **Padrón de Recinto** (`13`): lista/tabla de electores del recinto con búsqueda por
    nombre/cédula, filtros por colegio y estado (fidelizado/simpatizante/indeciso), y
    acción rápida para fidelizar o abrir ficha.
13. **Inscripción** (`14`): meta 38/50 con progreso, botón "Escanear Cédula" (simula OCR:
    genera datos de ejemplo) y "Ingreso Manual"; formulario de 3 pasos: (1) cédula +
    "Verificar" que simula JCE y autocompleta nombre/apellidos/recinto/mesa,
    (2) contacto y dirección, (3) chips de fidelización (Fidelizado/Simpatizante/Indeciso),
    CBA y célula, toggle movilización Día D; "Registrar e Inscribir Elector" guarda el
    elector en el store (actualiza KPIs) y agrega a "Inscritos Recientemente" con acciones
    WhatsApp (enlace `wa.me` con texto).
14. **Mi Carpeta** (`15`): hero del dirigente con meta 28/36, 3 métricas (contactos,
    voto seguro, pendientes), acciones (Agregar Elector → `/app/inscripcion`, Llamadas
    Hoy, Ruta de Visitas), búsqueda con filtro en vivo, pills de segmento (Todos, Por
    Llamar, Visita Pendiente, Voto Seguro, Indecisos) que filtran tarjetas de contacto
    (cada una con llamar `tel:`, WhatsApp `wa.me`, completar tarea que actualiza estado
    en store), widget inferior "5 llamadas restantes" + "Difusión" (toast).
15. **Fidelizados** (`16`): banner de red con "Día D: -18 días", métricas (total 1,420/
    meta 1,800, voto seguro 1,150, por revalidar 270), botón "+ Registrar Fidelizado",
    pills de filtros, búsqueda, tarjetas de fidelizados por nivel con reconfirmar voto
    (actualiza store) y contacto directo.
16. **CBA** (`17`): hero con 6 comités y 82% asegurado, KPIs (Voto Seguro 39, Por
    Visitar 9), "+ Crear Nuevo CBA" (formulario simple en hoja inferior que crea comité
    en store), chips de filtro (Todos/100%/En Proceso/Prioridad), búsqueda, tarjetas
    CBA con líderes, mesas y acciones (llamar, WhatsApp, ver integrantes, revalidar,
    auditoría).
17. **CBE** (`18`): cinta tricolor, cobertura de mesas 92% (11/12), métricas (22/24
    delegados, 640 voto duro), "+ Crear Nuevo Comité CBE", filtros (Todos, Blindados,
    Falta Suplente, Por Validar), tarjetas CBE con presidente, delegados titular/suplente
    (alerta si falta suplente), barra de voto comprometido, taller de acreditación con
    confirmación por WhatsApp.
18. **Call Center** (`19`): cuota de llamadas 42/60 con barra y ritmo, 3 métricas bento
    (votos seguros, transporte, reintentos), "Iniciar Siguiente Asignada" carga la ficha
    del elector (dossier) con guion colapsable, tipificación táctil: intención de voto
    (4 chips), logística Día D (3 chips), bloque horario (3 chips), nota; "Guardar y
    Pasar al Siguiente" persiste la tipificación, avanza la cola y actualiza cuota;
    cola prioritaria con reintento/agendados; banner motivacional.

## 5. Modelo de datos (localStorage, claves `clb.*`)

- `clb.session` — `{ cedula, username, role, loginAt }`
- `clb.users` — cuentas registradas: `{ cedula, username, passwordHash(simple), nombres,
  apellidos, telefono, role, createdAt }`
- `clb.electores` — electores inscritos y sembrados: `{ id, cedula, nombres, apellidos,
  telefono, whatsapp, sector, direccion, recinto, mesa, colegio, orden, estado:
  'fidelizado'|'simpatizante'|'indeciso', cba, celula, movilizacionDiaD, intento:
  {intencion, transporte, bloque, nota, tipificadoAt}, createdAt, registradoPor }`
- `clb.recinto` — datos del recinto demo (nombre, código, coordinador, meta, padronTotal)
- `clb.comites` — CBA y CBE: `{ id, tipo:'CBA'|'CBE', codigo, nombre, lider, cedulaLider,
  sector, recinto, mesa, estado:'blindado'|'proceso'|'prioridad', integrantes[],
  delegados:{titular,suplente}, votoComprometido, meta }`
- `clb.tareas` — tareas de carpeta (llamar/visitar) derivadas de electores
- `clb.llamadas` — registro de call center (cuota del día, resultados)
- `clb.incidencias` — novedades reportadas desde Mi Recinto
- Seed inicial: ~40 electores, 6 CBA, 12 CBE, recinto y colegios con los datos exactos de
  los mocks (Liceo Bernardo Pichardo, Escuela Juan Jiménez, Escuela Andrés Bello,
  Escuela Faustina Silva; mesas 0012A-F, etc.).

## 6. Arquitectura de código

```
clb-app/
  index.html                 (fuentes Google, Material Symbols, título)
  tailwind.config.js         (tokens CLB, fuentes, sombras)
  src/
    main.jsx, App.jsx        (router + guards)
    store/AppContext.jsx     (estado global + persistencia localStorage)
    data/seed.js             (datos demo fieles a los mocks)
    lib/format.js            (máscaras cédula/teléfono, helpers)
    components/              (AppHeader, BottomNav, Badge, Button, ProgressBar,
                              DonutChart, MetricCard, SearchBar, FilterPills,
                              ContactCard, StepHeader, Toast, Sheet, Avatar)
    pages/public/            (Portada, Unirme, Confirmacion, CrearUsuario, Otp,
                              Contrasena, Exito, Login, Validando)
    pages/app/               (Dashboard, MiRecinto, Padron, Inscripcion, MiCarpeta,
                              Fidelizados, Cba, Cbe, CallCenter, Perfil, Mas)
```

## 7. Objetivos, no-objetivos y anti-objetivos

- **Objetivo**: fidelidad visual a los mocks + funcionalidad coherente + persistencia
  local + navegación completa.
- **No-objetivos v1**: backend, SMS real, OCR real, geolocalización, variantes
  desktop/tablet, PWA instalable, multiidioma.
- **Anti-objetivos**: enlaces muertos sin comportamiento (todo botón visible debe hacer
  algo real: navegar, validar, guardar o mostrar toast explicativo); datos hardcodeados en
  pantallas donde el usuario puede crear/actualizar (los KPIs reflejan el store).

## 7b. Resoluciones del builder check (decisiones mías)

1. **Alcance de datos para usuarios nuevos**: el dataset territorial (electores, CBA, CBE,
   recinto) es compartido entre todos los usuarios; los KPIs de campaña son los mismos.
   `registradoPor` queda como procedencia. "Mi Carpeta" muestra los electores con
   `asignadoA == usuario actual`: el usuario demo siembra 36; a cada usuario nuevo se le
   asigna un subconjunto inicial (12 electores) más todo lo que registre.
2. **Rol**: cosmético en v1. Se guarda en cuenta/sesión y se muestra como badge
   ("Miembro"); no implica permisos ni pantallas distintas.
3. **KPIs macro vs semilla pequeña**: modelo de dos niveles. Los KPIs de campaña
   (245,678 inscritos, 1,420 fidelizados…) viven en contadores almacenados (`clb.metricas`)
   que arrancan con los valores de los mocks y se incrementan con las acciones del
   usuario (inscribir, fidelizar, tipificar). Los módulos personales (Mi Carpeta,
   cuota de llamadas, metas 38/50) se calculan de las filas reales.
4. **Cédula duplicada en registro**: se bloquea con error inline "Esta cédula ya está
   registrada. Inicia sesión." y enlace a `/login`.
5. **Perfil y Más**: mínimas y sin enlaces muertos. Perfil = datos del usuario, resumen
   de su actividad, botones "Restablecer datos demo" y "Cerrar sesión". Más = grilla de
   accesos a los módulos restantes (Fidelizados, CBA, CBE, Call Center, Perfil).

## 8. Verificación

- `npm run dev` y recorrer manualmente el flujo completo de registro → login → módulos.
- `npm run build` sin errores.
- Checklist por pantalla contra `stitch-reference/` (estructura, textos clave, colores).
- Validaciones: cédula 11 dígitos, username ≥6 único, OTP correcto, contraseña 5 reglas,
  formulario de inscripción con requeridos.
