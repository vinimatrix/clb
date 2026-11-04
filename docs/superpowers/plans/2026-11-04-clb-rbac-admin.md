# CLB RBAC + Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement role-based access control (Coordinador, Dirigente) with an admin panel to configure which modules each role can access. CBA and CBE modules are toggleable per role.

**Architecture:** Extend the existing store with role definitions and module permissions matrix. Add an Admin panel page accessible only to Coordinador role. Navigation (BottomNav, Más) filters modules based on current user's role permissions. Persist permissions in localStorage under `clb.permisos`.

**Tech Stack:** React 19, Vite 8, Tailwind v3.4, react-router-dom 7, Vitest + Testing Library. No backend.

**Spec:** This plan implements the user's requirement for roles and admin-configurable modules.

## Global Constraints

- Spanish UI copy; visual fidelity to existing Stitch mocks
- Demo account: cédula `402-1234567-8`, username `clbarcelo2026`, password `ClbSegura2026@`, role `Miembro` (maps to Dirigente)
- No backend; all data in localStorage (`clb.*` keys)
- Tailwind config under `clb-` color prefix
- TDD per task (RED → GREEN → commit)

## Review Focus

1. **Role assignment on login/register** — new users default to Dirigente; only Coordinador can access Admin panel
2. **Module visibility in BottomNav and Más** — filtered by `permisos[role][moduleId]`
3. **Route guards** — `/app/*` routes check permission before rendering; redirect to Dashboard if no access
4. **Admin panel persistence** — changes to `clb.permisos` survive reload
5. **CBA/CBE toggle** — independent toggle for each role (4 toggles total)

---

### Task 1: Extend Seed with Roles and Default Permissions

**Files:**
- Modify: `clb-app/src/data/seed.js`
- Test: `clb-app/src/test/seed.test.js` (add assertions)

**Interfaces:**
- Produces: `buildSeed()` returns `roles: [{id, nombre, descripcion}]`, `permisos: { Coordinador: {inscripcion: true, miRecinto: false, miCarpeta: false, cba: false, cbe: false}, Dirigente: {inscripcion: true, miRecinto: true, miCarpeta: true, cba: false, cbe: false} }`

- [ ] **Step 1: Write failing test assertions in seed.test.js**
```javascript
it('seed incluye roles y permisos por defecto', () => {
  const seed = buildSeed()
  expect(seed.roles).toHaveLength(2)
  expect(seed.roles.map(r => r.id)).toEqual(['coordinador', 'dirigente'])
  expect(seed.permisos.coordinador.inscripcion).toBe(true)
  expect(seed.permisos.dirigente.miRecinto).toBe(true)
  expect(seed.permisos.dirigente.miCarpeta).toBe(true)
  expect(seed.permisos.dirigente.cba).toBe(false)
  expect(seed.permisos.dirigente.cbe).toBe(false)
})
```

- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Add `roles` and `permisos` to `buildSeed()` in seed.js**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Store Actions for Permissions + Role Helpers

**Files:**
- Modify: `clb-app/src/store/AppContext.jsx` (add `permisos` to state, actions `actualizarPermiso`, `tienePermiso`)
- Test: `clb-app/src/test/store.test.js` (new test file)

**Interfaces:**
- Consumes: Task 1 `seed.permisos`
- Produces: `state.permisos`, `actions.actualizarPermiso(rol, modulo, valor)`, `actions.tienePermiso(modulo)` (uses current session role)

- [ ] **Step 1: Write failing tests for `actualizarPermiso` and `tienePermiso`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `permisos` in initialState, `actualizarPermiso`, `tienePermiso` in AppContext.jsx**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Route Guards with Permission Check

**Files:**
- Modify: `clb-app/src/routes.jsx` (wrap `/app/*` routes with `RequirePermiso`)
- Test: `clb-app/src/test/guards.test.jsx` (add tests)

**Interfaces:**
- Consumes: Task 2 `useApp().actions.tienePermiso`
- Produces: `RequirePermiso` component that redirects to `/app` if no permission

- [ ] **Step 1: Write failing tests for guard behavior**
```javascript
it('redirige a /app si Dirigente intenta acceder a CBA sin permiso', () => { ... })
it('permite acceso si Coordinador tiene permiso en CBA', () => { ... })
```
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Create `RequirePermiso` wrapper in routes.jsx, apply to `/app/inscripcion`, `/app/recinto`, `/app/carpeta`, `/app/fidelizados`, `/app/cba`, `/app/cbe`, `/app/callcenter`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Navigation Filtering (BottomNav + Más)

**Files:**
- Modify: `clb-app/src/components/BottomNav.jsx`, `clb-app/src/pages/app/Mas.jsx`
- Test: `clb-app/src/test/navigation.test.jsx` (new test file)

**Interfaces:**
- Consumes: Task 2 `useApp().actions.tienePermiso`, `useAppState().session.role`
- Produces: BottomNav shows only permitted tabs; Más grid shows only permitted modules

- [ ] **Step 1: Write failing tests for filtered navigation**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update BottomNav.jsx to filter tabs by `tienePermiso`; update Mas.jsx to filter grid by `tienePermiso`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Admin Panel Page (Solo Coordinador)

**Files:**
- Create: `clb-app/src/pages/app/AdminPanel.jsx` (ref: new design)
- Modify: `clb-app/src/routes.jsx` (add `/app/admin` route with RequirePermiso for 'admin' or Coordinador role)
- Modify: `clb-app/src/pages/app/Mas.jsx` (add "Administración" card for Coordinador)
- Test: `clb-app/src/test/admin-panel.test.jsx`

**Interfaces:**
- Consumes: Task 2 `state.permisos`, `actions.actualizarPermiso`, `state.roles`
- Produces: UI with role selector (Coordinador/Dirigente), module toggles (inscripcion, miRecinto, miCarpeta, cba, cbe), save button → toast + persist

- [ ] **Step 1: Write failing tests for AdminPanel**
```javascript
it('solo Coordinador ve la tarjeta Administración en Más', () => { ... })
it('AdminPanel muestra matriz de 2 roles x 5 módulos con toggles', () => { ... })
it('cambiar toggle persiste en localStorage clb.permisos', () => { ... })
```
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement AdminPanel.jsx with role tabs, module toggles, save action**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: Demo User Role Mapping + Login Integration

**Files:**
- Modify: `clb-app/src/store/AppContext.jsx` (login action sets session.role from seed.roles mapping)
- Modify: `clb-app/src/pages/public/Login.jsx` (show role hint)
- Test: `clb-app/src/test/login.test.jsx` (add assertions)

**Interfaces:**
- Consumes: seed.roles
- Produces: session.role = 'coordinador' | 'dirigente' (demo user = dirigente)

- [ ] **Step 1: Write failing test for role in session**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update login action to include role; update Login.jsx hint**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 7: E2E Test + Visual Verification

**Files:**
- Modify: `clb-app/scripts/e2e.mjs` (add role/permission checks)
- Test: run full suite + e2e

**Interfaces:**
- Consumes: all previous tasks
- Produces: verified role-based navigation, admin panel functional

- [ ] **Step 1: Update e2e script to test Coordinador vs Dirigente flows**
- [ ] **Step 2: Run full test suite + build + e2e**
- [ ] **Step 3: Commit final**

---