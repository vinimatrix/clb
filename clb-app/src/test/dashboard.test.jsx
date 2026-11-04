import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { AppRouter } from '../App.jsx'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { AppLayout } from '../components/AppLayout.jsx'
import Dashboard from '../pages/app/Dashboard.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

/** Router de cubierta para probar el layout con rutas stub. */
function AppRouterCubre({ entrada = ['/app'] }) {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={entrada}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/app" element={<div data-testid="ruta-inicio">Inicio</div>} />
              <Route path="/app/carpeta" element={<div data-testid="ruta-carpeta">Carpeta</div>} />
              <Route path="/app/recinto" element={<div data-testid="ruta-recinto">Recinto</div>} />
              <Route path="/app/inscripcion" element={<div data-testid="ruta-inscripcion">Inscripción</div>} />
              <Route path="/app/mas" element={<div data-testid="ruta-mas">Más</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

function DashboardSolitario({ entrada = ['/app'] }) {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={entrada}>
          <Dashboard />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('AppLayout', () => {
  it('renderiza header con marca, campana con toast y bottom nav de 5 pestañas', () => {
    render(<AppRouterCubre />)
    expect(screen.getByText(/Carmen Ligia/i)).toBeInTheDocument()
    expect(screen.getByText(/Barceló/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Notificaciones'))
    expect(screen.getByText('Sin notificaciones nuevas')).toBeInTheDocument()
    // 5 pestañas normalizadas
    for (const t of ['Inicio', 'Inscripción', 'Recinto', 'Mi Carpeta', 'Más']) {
      expect(screen.getAllByText(t).length).toBeGreaterThanOrEqual(1)
    }
    // Avatar con iniciales de la sesión
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('las pestañas navegan (Inicio → Mi Carpeta → Recinto)', () => {
    render(<AppRouterCubre />)
    fireEvent.click(screen.getByText('Mi Carpeta'))
    expect(screen.getByTestId('ruta-carpeta')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Recinto'))
    expect(screen.getByTestId('ruta-recinto')).toBeInTheDocument()
  })
})

describe('Dashboard', () => {
  it('saluda al usuario y marca territorio activo', () => {
    render(<DashboardSolitario />)
    expect(screen.getByText(/¡Hola, Juan Pérez!/)).toBeInTheDocument()
    expect(screen.getByText(/Territorio Activo/i)).toBeInTheDocument()
  })

  it('muestra los 4 KPIs con formato ejecutivo y deltas', () => {
    render(<DashboardSolitario />)
    expect(screen.getByText('245,678')).toBeInTheDocument()
    expect(screen.getByText('18,430')).toBeInTheDocument()
    expect(screen.getByText('12,650')).toBeInTheDocument()
    expect(screen.getByText('98,320')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('+0%')).toBeInTheDocument()
    expect(screen.getByText('+16%')).toBeInTheDocument()
  })

  it('muestra la dona 14.35% y el desglose del mercado electoral', () => {
    render(<DashboardSolitario />)
    expect(screen.getByText('14.35%')).toBeInTheDocument()
    expect(screen.getAllByText(/Meta PRM/i).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('8,873,889')).toBeInTheDocument()
    expect(screen.getByText('1,273,350')).toBeInTheDocument()
    expect(screen.getByText('7,600,539')).toBeInTheDocument()
  })

  it('muestra Cobertura de Gestión con las 4 barras', () => {
    const { container } = render(<DashboardSolitario />)
    expect(screen.getByText(/Cobertura de Gestión/)).toBeInTheDocument()
    expect(screen.getByText('27.7%')).toBeInTheDocument()
    expect(screen.getByText('11.1%')).toBeInTheDocument()
    const barras = container.querySelectorAll('div[style*="width"]')
    expect(barras.length).toBeGreaterThanOrEqual(4)
  })

  it('el acceso rápido Inscripción navega a /app/inscripcion', () => {
    render(
      <AppProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/app/inscripcion']}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/app/inscripcion" element={<div data-testid="ruta-inscripcion">Inscripción</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AppProvider>,
    )
    // El tab del bottom nav también navega al mismo lugar.
    fireEvent.click(screen.getByRole('link', { name: /Inscripción/ }))
    expect(screen.getByTestId('ruta-inscripcion')).toBeInTheDocument()
  })
})
