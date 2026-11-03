import { beforeEach, describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { createStoreLogic } from '../store/actions.js'
import { load } from '../lib/storage.js'
import { verifyPassword } from '../lib/hash.js'

function nuevo() {
  return createStoreLogic(buildSeed())
}

describe('store — cuentas y sesión', () => {
  beforeEach(() => localStorage.clear())

  it('bloquea registro con cédula duplicada (demo)', () => {
    const s = nuevo()
    const res = s.registrarCuenta({
      cedula: '402-1234567-8', username: 'otro2026', password: 'Clave1234@',
      nombres: 'Ana', apellidos: 'Reyes', telefono: '809-000-0000',
    })
    expect(res.ok).toBe(false)
    expect(res.error).toBe('Esta cédula ya está registrada. Inicia sesión.')
  })

  it('rechaza username corto o tomado', () => {
    const s = nuevo()
    expect(s.registrarCuenta({ cedula: '031-1111111-1', username: 'abc', password: 'Clave1234@', nombres: 'A', apellidos: 'B' }).error)
      .toBe('Mínimo 6 caracteres')
    expect(s.registrarCuenta({ cedula: '031-1111111-1', username: 'clbarcelo2026', password: 'Clave1234@', nombres: 'A', apellidos: 'B' }).error)
      .toBe('Usuario no disponible')
  })

  it('registra cuenta nueva', () => {
    const s = nuevo()
    const res = s.registrarCuenta({
      cedula: '031-1111111-1', username: 'nuevo2026', password: 'Clave1234@',
      nombres: 'Ana', apellidos: 'Reyes', telefono: '809-000-0000',
    })
    expect(res.ok).toBe(true)
    const user = s.getState().users.find((u) => u.username === 'nuevo2026')
    expect(user).toBeTruthy()
    expect(verifyPassword('Clave1234@', user.passwordHash)).toBe(true)
  })

  it('login inválido da error exacto; demo correcto crea sesión', () => {
    const s = nuevo()
    expect(s.login('402-1234567-8', 'MalaClave1!')).toEqual({ ok: false, error: 'Credenciales incorrectas' })
    const ok = s.login('40212345678', 'ClbSegura2026@')
    expect(ok.ok).toBe(true)
    expect(s.getState().session.username).toBe('clbarcelo2026')
    expect(s.getState().session.role).toBe('Miembro')
  })

  it('logout limpia la sesión', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    s.logout()
    expect(s.getState().session).toBeNull()
  })
})

describe('store — OTP', () => {
  beforeEach(() => localStorage.clear())

  it('genera 5 dígitos y valida solo el código correcto', () => {
    const s = nuevo()
    const code = s.generarOtp()
    expect(code).toMatch(/^\d{5}$/)
    expect(s.validarOtp(code)).toBe(true)
    expect(s.validarOtp('00000')).toBe(code === '00000')
    expect(s.validarOtp('99999')).toBe(code === '99999')
  })
})

describe('store — electores, tareas y métricas', () => {
  beforeEach(() => localStorage.clear())

  it('addElector fidelizado incrementa inscritos y fidelizados sin tarea', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    const antes = s.getState().metricas
    const total = s.getState().electores.length
    const tareas = s.getState().tareas.filter((t) => t.estado === 'pendiente').length
    const e = s.addElector({
      cedula: '031-2222222-2', nombres: 'Pedro', apellidos: 'Prueba', telefono: '829-000-0001',
      estado: 'fidelizado', recinto: 'Liceo Bernardo Pichardo', mesa: '0012A', orden: 500,
    })
    expect(s.getState().electores.length).toBe(total + 1)
    expect(s.getState().metricas.inscritos).toBe(antes.inscritos + 1)
    expect(s.getState().metricas.fidelizados).toBe(antes.fidelizados + 1)
    expect(s.getState().metricas.fidelizadosCirc).toBe(antes.fidelizadosCirc + 1)
    expect(s.getState().tareas.filter((t) => t.estado === 'pendiente').length).toBe(tareas)
    expect(e.asignadoA).toBe('clbarcelo2026')
    expect(e.registradoPor).toBe('clbarcelo2026')
  })

  it('addElector indeciso crea tarea de llamada', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    const e = s.addElector({
      cedula: '031-3333333-3', nombres: 'Marta', apellidos: 'Indecisa', telefono: '829-000-0002',
      estado: 'indeciso',
    })
    const t = s.getState().tareas.find((x) => x.electorId === e.id)
    expect(t.tipo).toBe('llamada')
  })

  it('tipificar voto-seguro sobre indeciso lo fideliza y suma cuota', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    const indeciso = s.getState().electores.find((e) => e.estado === 'indeciso')
    const antes = s.getState().metricas
    const cuota = s.getState().llamadas.completadasHoy
    s.tipificarElector(indeciso.id, { intencion: 'voto-seguro', transporte: 'propio', bloque: 'manana', nota: '' })
    const after = s.getState().electores.find((e) => e.id === indeciso.id)
    expect(after.estado).toBe('fidelizado')
    expect(after.intento.intencion).toBe('voto-seguro')
    expect(s.getState().metricas.fidelizados).toBe(antes.fidelizados + 1)
    expect(s.getState().metricas.votoSeguroCirc).toBe(antes.votoSeguroCirc + 1)
    expect(s.getState().llamadas.completadasHoy).toBe(cuota + 1)
  })

  it('completarTarea marca completada', () => {
    const s = nuevo()
    const t = s.getState().tareas.find((x) => x.estado === 'pendiente')
    s.completarTarea(t.id)
    expect(s.getState().tareas.find((x) => x.id === t.id).estado).toBe('completada')
  })

  it('persistencia: los cambios aterrizan en localStorage', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    s.addElector({ cedula: '031-4444444-4', nombres: 'Luisa', apellidos: 'Persiste', telefono: '829-000-0003', estado: 'fidelizado' })
    const guardados = load('clb.electores', [])
    expect(guardados.some((e) => e.apellidos === 'Persiste')).toBe(true)
    expect(load('clb.session', null).username).toBe('clbarcelo2026')
  })

  it('resetDemo restaura la semilla conservando usuarios y limpia sesión', () => {
    const s = nuevo()
    s.login('402-1234567-8', 'ClbSegura2026@')
    s.addElector({ cedula: '031-5555555-5', nombres: 'Extra', apellidos: 'Temporal', telefono: '829-000-0004', estado: 'fidelizado' })
    s.resetDemo()
    expect(s.getState().electores).toHaveLength(44) // la semilla reemplaza todo lo creado
    expect(s.getState().session).toBeNull()
    expect(s.getState().users.some((u) => u.username === 'clbarcelo2026')).toBe(true)
  })
})

describe('store — comités, incidencias y verificación JCE', () => {
  beforeEach(() => localStorage.clear())

  it('addComite incrementa el tipo correspondiente con código consecutivo', () => {
    const s = nuevo()
    const cbaAntes = s.getState().comites.filter((c) => c.tipo === 'CBA').length
    const c = s.addComite('CBA', { nombre: 'Familia Prueba', lider: 'Líder P.', cedulaLider: '001-9999999-9', sector: 'Centro', recinto: 'Escuela X' })
    expect(s.getState().comites.filter((x) => x.tipo === 'CBA')).toHaveLength(cbaAntes + 1)
    expect(c.codigo).toMatch(/^CBA-/)
  })

  it('reportarIncidencia agrega al listado', () => {
    const s = nuevo()
    s.reportarIncidencia({ colegio: '0012C', texto: 'Falta suplente confirmado' })
    expect(s.getState().incidencias).toHaveLength(1)
    expect(s.getState().incidencias[0].texto).toBe('Falta suplente confirmado')
  })

  it('verificarCedula devuelve datos del elector conocido o genera determinista', () => {
    const s = nuevo()
    const conocida = s.verificarCedula('001-0982341-2')
    expect(conocida.habilitado).toBe(true)
    expect(conocida.datos.nombres).toBe('Rosa Esther')
    const r1 = s.verificarCedula('402-7777777-1')
    const r2 = s.verificarCedula('402-7777777-1')
    expect(r1.habilitado).toBe(true)
    expect(r1.datos.nombres).toBe(r2.datos.nombres)
    expect(r1.datos.recinto).toBeTruthy()
    expect(r1.datos.mesa).toBeTruthy()
  })
})
