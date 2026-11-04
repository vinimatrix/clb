import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save, load } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { AppRouter } from '../App.jsx'
import MiCarpeta from '../pages/app/MiCarpeta.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

function Page() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/carpeta']}>
          <MiCarpeta />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Mi Carpeta — métricas y hero', () => {
  it('muestra 36 contactos, 28 voto seguro, 8 pendientes y 78% de meta', () => {
    render(<Page />)
    expect(screen.getByText('36', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('28', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('8', { exact: true })).toBeInTheDocument()
    expect(screen.getByText(/78%/)).toBeInTheDocument()
    expect(screen.getByText('77.8% Éxito')).toBeInTheDocument()
    expect(screen.getByText('5 Llam • 3 Vis')).toBeInTheDocument()
    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
  })
})

describe('Filtros de tareas', () => {
  it('pill Por Llamar muestra 5 tarjetas', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Por Llamar/ }))
    expect(screen.getAllByTestId('carpeta-card')).toHaveLength(5)
  })

  it('completar una tarea de llamada la quita de Por Llamar (quedan 4)', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Por Llamar/ }))
    const primera = screen.getAllByTestId('carpeta-card')[0]
    fireEvent.click(primera.querySelector('button[data-accion="completar"]'))
    const restantes = screen.getAllByTestId('carpeta-card')
    expect(restantes).toHaveLength(4)
    // Persistió: quedan 4 llamadas pendientes
    const tareas = JSON.parse(localStorage.getItem('clb.tareas'))
    expect(tareas.filter((t) => t.tipo === 'llamada' && t.estado === 'pendiente')).toHaveLength(4)
  })

  it('pill Visita Pendiente muestra 3 tarjetas', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Visita Pendiente/ }))
    expect(screen.getAllByTestId('carpeta-card')).toHaveLength(3)
  })

  it('pill Voto Seguro muestra 28 tarjetas', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Voto Seguro/ }))
    expect(screen.getAllByTestId('carpeta-card')).toHaveLength(28)
  })
})

describe('Búsqueda', () => {
  it('buscar "Marcos" devuelve 1 tarjeta (Marcos Aurelio Peguero)', () => {
    render(<Page />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), { target: { value: 'Marcos' } })
    const tarjetas = screen.getAllByTestId('carpeta-card')
    expect(tarjetas).toHaveLength(1)
    expect(screen.getByText('Marcos Aurelio')).toBeInTheDocument()
    expect(screen.getByText('Peguero')).toBeInTheDocument()
  })
})

describe('Widget inferior', () => {
  it('Difusión abre un toast', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Difusión/ }))
    expect(screen.getByTestId('toast')).toBeInTheDocument()
  })
})

describe('Perfil', () => {
  function PerfilRisoPage() {
    return <AppRouter initialEntries={['/app/perfil']} />
  }
  it('muestra datos de sesión y botón Restablecer', () => {
    render(<PerfilRisoPage />)
    expect(screen.getByText('@clbarcelo2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Restablecer datos demo/ })).toBeInTheDocument()
  })

  it('Cerrar sesión borra la sesión y regresa a la portada', async () => {
    render(<PerfilRisoPage />)
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }))
    await waitFor(() => expect(screen.getByTestId('portada')).toBeInTheDocument())
    expect(load('clb.session', null)).toBeNull()
  })
})
