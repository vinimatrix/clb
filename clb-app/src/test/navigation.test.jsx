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
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
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
  it('BottomNav muestra solo tabs permitidos para Dirigente', () => {
    render(<NavPage />)
    // Dirigente tiene: inscripcion, miRecinto, miCarpeta
    expect(screen.getByRole('link', { name: /Inscripción/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Recinto/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mi Carpeta/ })).toBeInTheDocument()
    // Dirigente NO tiene: fidelizados (cba/cbe/fidelizados)
    expect(screen.queryByRole('link', { name: /Fidelizados/ })).not.toBeInTheDocument()
  })

  it('BottomNav muestra solo tabs permitidos para Coordinador', () => {
    const seed = buildSeed()
    localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' }))
    save('clb.users', seed.users)
    
    render(<NavPage />)
    // Coordinador tiene: inscripcion
    expect(screen.getByRole('link', { name: /Inscripción/ })).toBeInTheDocument()
    // Coordinador NO tiene: miRecinto, miCarpeta, fidelizados
    expect(screen.queryByRole('link', { name: /Recinto/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Mi Carpeta/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Fidelizados/ })).not.toBeInTheDocument()
  })

  it('Mas grid muestra solo módulos permitidos para Dirigente', () => {
    render(<MasPage />)
    // Dirigente NO tiene acceso a Fidelizados, CBA, CBE por defecto
    // Call Center SÍ está habilitado para Dirigente (seed actualizado)
    expect(screen.queryByText('Fidelizados')).not.toBeInTheDocument()
    expect(screen.queryByText('CBA')).not.toBeInTheDocument()
    expect(screen.queryByText('CBE')).not.toBeInTheDocument()
    expect(screen.getByText('Call Center')).toBeInTheDocument()
  })

  it('Mas grid muestra módulos habilitados para Coordinador', () => {
    const seed = buildSeed()
    const permisosModificados = {
      ...seed.permisos,
      coordinador: { ...seed.permisos.coordinador, cba: true, cbe: true, callcenter: true }
    }
    localStorage.setItem('clb.permisos', JSON.stringify(permisosModificados))
    save('clb.users', seed.users)
    localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' }))
    
    render(<MasPage />)
    // Con permisos habilitados
    expect(screen.getByText('CBA')).toBeInTheDocument()
    expect(screen.getByText('CBE')).toBeInTheDocument()
    expect(screen.getByText('Call Center')).toBeInTheDocument()
  })
})