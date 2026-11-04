import { render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { AppRouter } from '../App.jsx'
import { save } from '../lib/storage.js'

function conSesion(role = 'dirigente') {
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role, nombres: 'Juan', apellidos: 'Pérez' })
}

describe('guardas de sesión', () => {
  it('sin sesión, /app redirige a /login', () => {
    render(<AppRouter initialEntries={['/app']} />)
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('sin sesión, /app/callcenter también redirige', () => {
    render(<AppRouter initialEntries={['/app/callcenter']} />)
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('con sesión, /app muestra el placeholder del dashboard', () => {
    conSesion()
    render(<AppRouter initialEntries={['/app']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
  })
})

describe('guardas de permisos por rol', () => {
  beforeEach(() => {
    localStorage.clear()
    const seed = buildSeed()
    save('clb.users', seed.users)
  })

  it('redirige a /app si Dirigente intenta acceder a CBA sin permiso', () => {
    save('clb.session', { cedula: '402-1234567-8', username: 'dirigente1', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/cba']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
  })

  it('permite acceso si Coordinador tiene permiso en CBA (tras habilitarlo en admin)', () => {
    const seed = buildSeed()
    const permisosModificados = {
      ...seed.permisos,
      coordinador: { ...seed.permisos.coordinador, cba: true }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(permisosModificados))
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' })
    render(<AppRouter initialEntries={['/app/cba']} />)
    expect(screen.getByTestId('page-cba')).toBeInTheDocument()
  })

  it('redirige a /app si Dirigente intenta acceder a CBE sin permiso', () => {
    save('clb.session', { cedula: '402-1234567-8', username: 'dirigente1', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/cbe']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
  })

  it('permite acceso si Coordinador tiene permiso en CBE (tras habilitarlo en admin)', () => {
    const seed = buildSeed()
    const permisosModificados = {
      ...seed.permisos,
      coordinador: { ...seed.permisos.coordinador, cbe: true }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(permisosModificados))
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' })
    render(<AppRouter initialEntries={['/app/cbe']} />)
    expect(screen.getByTestId('page-cbe')).toBeInTheDocument()
  })

  it('Dirigente puede acceder a Mi Recinto (tiene permiso)', () => {
    save('clb.session', { cedula: '402-1234567-8', username: 'dirigente1', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/recinto']} />)
    expect(screen.getByTestId('page-recinto')).toBeInTheDocument()
  })

  it('Dirigente puede acceder a Mi Carpeta (tiene permiso)', () => {
    save('clb.session', { cedula: '402-1234567-8', username: 'dirigente1', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/carpeta']} />)
    expect(screen.getByTestId('page-carpeta')).toBeInTheDocument()
  })

  it('Dirigente puede acceder a Inscripción (tiene permiso)', () => {
    save('clb.session', { cedula: '402-1234567-8', username: 'dirigente1', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/inscripcion']} />)
    expect(screen.getByTestId('page-inscripcion')).toBeInTheDocument()
  })
})
