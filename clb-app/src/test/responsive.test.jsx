import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav.jsx'
import { Sidebar } from '../components/Sidebar.jsx'
import { AppProvider } from '../store/AppContext.jsx'
import { save } from '../lib/storage.js'
import { buildSeed } from '../data/seed.js'

const TABS = [
  { path: '/app', icon: 'dashboard', label: 'Inicio' },
  { path: '/app/inscripcion', icon: 'person_add', label: 'Inscripción' },
  { path: '/app/recinto', icon: 'location_on', label: 'Recinto' },
  { path: '/app/carpeta', icon: 'folder_shared', label: 'Mi Carpeta' },
  { path: '/app/mas', icon: 'apps', label: 'Más' },
]

const renderWithProviders = (ui) => {
  // Setup localStorage with admin user who has all permissions
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  localStorage.setItem('clb.permisos', JSON.stringify(seed.permisos))
  localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-0', username: 'admin2026', role: 'admin', nombres: 'Admin', apellidos: 'Sistema' }))

  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/app']}>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Responsive layout', () => {
  it('BottomNav tiene clase para ocultar en desktop', () => {
    renderWithProviders(<BottomNav items={TABS} />)
    const nav = screen.getByTestId('bottom-nav')
    expect(nav).toHaveClass('md:hidden')
  })

  it('BottomNav tiene clase para mostrar en móvil', () => {
    renderWithProviders(<BottomNav items={TABS} />)
    const nav = screen.getByTestId('bottom-nav')
    expect(nav).toHaveClass('block')
  })

  it('Sidebar tiene clase para ocultar en móvil', () => {
    renderWithProviders(<Sidebar items={TABS} />)
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('hidden')
    expect(sidebar).toHaveClass('md:flex')
  })

  it('Sidebar muestra los ítems de navegación', () => {
    renderWithProviders(<Sidebar items={TABS} />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Inscripción')).toBeInTheDocument()
    expect(screen.getByText('Recinto')).toBeInTheDocument()
    expect(screen.getByText('Mi Carpeta')).toBeInTheDocument()
    expect(screen.getByText('Más')).toBeInTheDocument()
  })
})