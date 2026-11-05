import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { BottomNav } from '../components/BottomNav.jsx'
import Mas from '../pages/app/Mas.jsx'
import { AppRouter } from '../App.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

function NavPage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app']}>
          <BottomNav items={[
            { path: '/app/inscripcion', label: 'Inscripción', icon: 'how_to_reg' },
            { path: '/app/recinto', label: 'Recinto', icon: 'apartment' },
            { path: '/app/carpeta', label: 'Mi Carpeta', icon: 'folder' },
            { path: '/app/fidelizados', label: 'Fidelizados', icon: 'loyalty' },
            { path: '/app/mas', label: 'Más', icon: 'more_horiz' },
          ]} />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

function MasPage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/mas']}>
          <Mas />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Navigation filtering by role permissions', () => {
  it('BottomNav muestra tabs permitidos para Dirigente (Inscripción, Recinto, Carpeta, Más)', () => {
    render(<NavPage />)
    // Dirigente tiene: Inscripción, Mi Recinto, Mi Carpeta, Más
    expect(screen.getByRole('link', { name: /Inscripción/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Recinto/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mi Carpeta/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Más/ })).toBeInTheDocument()
    // Dirigente NO tiene: Fidelizados, Call Center
    expect(screen.queryByRole('link', { name: /Fidelizados/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Call Center/ })).not.toBeInTheDocument()
  })

  it('Mas grid muestra módulos permitidos para Dirigente', () => {
    render(<MasPage />)
    // Dirigente ve: Fidelizados (no), Call Center (no), Admin (no), CBA (no), CBE (no)
    // Dirigente solo ve: Fidelizados (no), Call Center (no), Admin (no)
    // En Más solo ve botones para: Fidelizados (no), Call Center (no), Admin (no)
    // Pero ve botones para: Ir a Mi Perfil, Volver a Inicio
    expect(screen.queryByText('Fidelizados')).not.toBeInTheDocument()
    expect(screen.queryByText('Call Center')).not.toBeInTheDocument()
    expect(screen.queryByText('CBA')).not.toBeInTheDocument()
    expect(screen.queryByText('CBE')).not.toBeInTheDocument()
    expect(screen.queryByText('Administración')).not.toBeInTheDocument()
    // Pero sí ve botones de navegación
    expect(screen.getByText('Ir a Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Volver a Inicio')).toBeInTheDocument()
  })

  it('BottomNav muestra tabs permitidos para Coordinador (Inscripción + Más/Admin)', () => {
    const seed = buildSeed()
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' })
    
    render(<NavPage />)
    // Coordinador solo tiene Inscripción y Más (admin)
    expect(screen.getByRole('link', { name: /Inscripción/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Más/ })).toBeInTheDocument()
    // Coordinador NO tiene: Recinto, Mi Carpeta, Fidelizados, Call Center
    expect(screen.queryByRole('link', { name: /Recinto/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Mi Carpeta/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Fidelizados/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Call Center/ })).not.toBeInTheDocument()
  })

  it('Mas grid muestra módulos permitidos para Coordinador (sin módulos, solo botones de navegación)', () => {
    const seed = buildSeed()
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' })
    
    render(<MasPage />)
    // Coordinador NO tiene permisos para módulos en Mas, solo ve botones de navegación
    expect(screen.queryByText('Fidelizados')).not.toBeInTheDocument()
    expect(screen.queryByText('CBA')).not.toBeInTheDocument()
    expect(screen.queryByText('CBE')).not.toBeInTheDocument()
    expect(screen.queryByText('Call Center')).not.toBeInTheDocument()
    expect(screen.queryByText('Administración')).not.toBeInTheDocument()
    // Pero sí ve botones de navegación
    expect(screen.getByText('Ir a Mi Perfil')).toBeInTheDocument()
    expect(screen.getByText('Volver a Inicio')).toBeInTheDocument()
  })
})