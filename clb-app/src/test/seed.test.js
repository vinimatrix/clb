import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { verifyPassword } from '../lib/hash.js'

describe('buildSeed', () => {
  const seed = buildSeed()

  it('siembra la cuenta demo con hash de contraseña', () => {
    expect(seed.users).toHaveLength(1)
    const demo = seed.users[0]
    expect(demo.cedula).toBe('402-1234567-8')
    expect(demo.username).toBe('clbarcelo2026')
    expect(verifyPassword('ClbSegura2026@', demo.passwordHash)).toBe(true)
    expect(demo.role).toBe('Miembro')
    expect(demo.nombres).toBe('Juan')
  })

  it('siembra 44 electores, 38 inscritos hoy por demo', () => {
    expect(seed.electores).toHaveLength(44)
    const hoy = new Date().toDateString()
    const deHoy = seed.electores.filter(
      (e) => e.registradoPor === 'demo' && new Date(e.createdAt).toDateString() === hoy,
    )
    expect(deHoy).toHaveLength(38)
  })

  it('asigna 36 electores a la carpeta demo: 28 fidelizado, 5 indeciso, 3 simpatizante', () => {
    const asig = seed.electores.filter((e) => e.asignadoA === 'demo')
    expect(asig).toHaveLength(36)
    expect(asig.filter((e) => e.estado === 'fidelizado')).toHaveLength(28)
    expect(asig.filter((e) => e.estado === 'indeciso')).toHaveLength(5)
    expect(asig.filter((e) => e.estado === 'simpatizante')).toHaveLength(3)
  })

  it('siembra 5 tareas de llamada y 3 de visita pendientes', () => {
    expect(seed.tareas.filter((t) => t.tipo === 'llamada')).toHaveLength(5)
    expect(seed.tareas.filter((t) => t.tipo === 'visita')).toHaveLength(3)
    expect(seed.tareas.every((t) => t.estado === 'pendiente')).toBe(true)
  })

  it('siembra 6 CBA y 12 CBE', () => {
    expect(seed.comites.filter((c) => c.tipo === 'CBA')).toHaveLength(6)
    expect(seed.comites.filter((c) => c.tipo === 'CBE')).toHaveLength(12)
    const cbe14 = seed.comites.find((c) => c.codigo === 'CBE-014')
    expect(cbe14.lider).toBe('Dr. Franklin Mercedes')
    const cbe28 = seed.comites.find((c) => c.codigo === 'CBE-028')
    expect(cbe28.delegados.suplente).toBe('Sin Designar')
    expect(cbe28.estado).toBe('falta-suplente')
  })

  it('siembra el recinto con 6 colegios', () => {
    expect(seed.recinto.nombre).toBe('Liceo Secundario Bernardo Pichardo')
    expect(seed.recinto.meta).toBe(1850)
    expect(seed.recinto.colegios).toHaveLength(6)
    expect(seed.recinto.colegios[0].codigo).toBe('0012A')
    expect(seed.recinto.colegios[2].delegado).toBe('José Almonte')
    expect(seed.recinto.colegios[2].estado).toBe('falta-suplente')
  })

  it('siembra métricas de campaña y de circunscripción', () => {
    expect(seed.metricas.inscritos).toBe(245678)
    expect(seed.metricas.cba).toBe(18430)
    expect(seed.metricas.cbe).toBe(12650)
    expect(seed.metricas.fidelizados).toBe(98320)
    expect(seed.metricas.mercadoTotal).toBe(8873889)
    expect(seed.metricas.fidelizadosCirc).toBe(1420)
    expect(seed.metricas.votoSeguroCirc).toBe(1150)
    expect(seed.metricas.porRevalidarCirc).toBe(270)
    expect(seed.metricas.metaFidelizadosCirc).toBe(1800)
  })

  it('siembra la cuota de llamadas del día', () => {
    expect(seed.llamadas.metaDiaria).toBe(60)
    expect(seed.llamadas.completadasHoy).toBe(42)
    expect(seed.llamadas.cola).toHaveLength(3)
    expect(seed.llamadas.cola[0].nombre).toBe('Manuel Antonio Castillo')
  })

  it('el primer asignado a demo sin intento es Carmen Rosa Altagracia Silvestre', () => {
    const primero = seed.electores.find((e) => e.asignadoA === 'demo' && !e.intento)
    expect(primero.nombres).toBe('Carmen Rosa')
    expect(primero.apellidos).toBe('Altagracia Silvestre')
    expect(primero.cedula).toBe('027-0056192-0')
    expect(primero.mesa).toBe('0012B')
  })

  it('las cédulas son únicas', () => {
    const ceds = seed.electores.map((e) => e.cedula)
    expect(new Set(ceds).size).toBe(ceds.length)
  })

  it('es serializable a JSON', () => {
    expect(() => JSON.parse(JSON.stringify(seed))).not.toThrow()
  })

  it('siembra roles y permisos por defecto', () => {
    expect(seed.roles).toHaveLength(2)
    expect(seed.roles.map(r => r.id)).toEqual(['coordinador', 'dirigente'])
    expect(seed.permisos.coordinador.inscripcion).toBe(true)
    expect(seed.permisos.dirigente.miRecinto).toBe(true)
    expect(seed.permisos.dirigente.miCarpeta).toBe(true)
    expect(seed.permisos.dirigente.cba).toBe(false)
    expect(seed.permisos.dirigente.cbe).toBe(false)
  })
})
