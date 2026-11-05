import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { save, load } from '../lib/storage.js'
import { AppRouter } from '../App.jsx'

vi.stubGlobal('confirm', () => true)

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

describe('flujo integral de la app', () => {
  it('navega por las 5 tabs y los módulos del centro Más', async () => {
    const seed = buildSeed()
    const permisosConCallCenter = {
      ...seed.permisos,
      dirigente: { ...seed.permisos.dirigente, callcenter: true }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(permisosConCallCenter))
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })

    render(<AppRouter initialEntries={['/app']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Inscripción/ }))
    expect(screen.getByTestId('page-inscripcion')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Recinto/ }))
    expect(screen.getByTestId('page-recinto')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Ver Padrón de Recinto/ }))
    expect(screen.getByTestId('page-padron')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Mi Carpeta/ }))
    expect(screen.getByTestId('page-carpeta')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Más/, exact: true }))
    expect(screen.getByTestId('page-mas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Call Center/ }))
    expect(screen.getByTestId('page-callcenter')).toBeInTheDocument()
  })

  it('desde Más acceso a Fidelizados, CBA y CBE, y el logout regresa a la portada', async () => {
    const seed = buildSeed()
    const permisosModificados = {
      ...seed.permisos,
      coordinador: { ...seed.permisos.coordinador, fidelizados: true, cba: true, cbe: true }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(permisosModificados))
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' })

    render(<AppRouter initialEntries={['/app/mas']} />)
    expect(screen.getByTestId('page-mas')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Fidelizados/ }))
    expect(screen.getByTestId('page-fidelizados')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Inicio/ }))
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Más/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ir a Mi Perfil/ }))
    expect(screen.getByTestId('page-perfil')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }))
    await waitFor(() => expect(screen.getByTestId('portada')).toBeInTheDocument())
    expect(load('clb.session', null)).toBeNull()
  })
})