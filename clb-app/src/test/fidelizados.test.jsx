import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { AppRouter } from '../App.jsx'
import Fidelizados from '../pages/app/Fidelizados.jsx'

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
        <MemoryRouter initialEntries={['/app/fidelizados']}>
          <Fidelizados />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Fidelizados — red de circunscripción', () => {
  it('banner y contadores vive del seed', () => {
    render(<Page />)
    expect(screen.getByText('Red de Fidelizados CLB')).toBeInTheDocument()
    expect(screen.getByText('Día D: -18 días')).toBeInTheDocument()
    expect(screen.getByText('1,420')).toBeInTheDocument()
    expect(screen.getByText('Meta 1,800')).toBeInTheDocument()
    expect(screen.getByText('78.9% alcanzado')).toBeInTheDocument()
    expect(screen.getByText('1,150')).toBeInTheDocument() // voto seguro
    expect(screen.getByText('270')).toBeInTheDocument() // por revalidar
  })

  it('renderiza tarjetas de electores fidelizado/simpatizante con contacto', () => {
    render(<Page />)
    expect(screen.getAllByTestId('fid-card').length).toBeGreaterThanOrEqual(20)
    expect(screen.getAllByLabelText(/Enviar WhatsApp/).length).toBeGreaterThanOrEqual(20)
  })

  it('Reconfirmar Voto marca la fecha y dispara toast', () => {
    render(<Page />)
    const boton = screen.getAllByRole('button', { name: /Reconfirmar Voto/ })[0]
    fireEvent.click(boton)
    expect(screen.getByTestId('toast')).toBeInTheDocument()
    const guardados = JSON.parse(localStorage.getItem('clb.electores'))
    expect(guardados.some((e) => e.reconfirmadoAt)).toBe(true)
  })

  it('"Registrar Fidelizado" navega a la inscripción', () => {
    render(<AppRouter initialEntries={['/app/fidelizados']} />)
    fireEvent.click(screen.getByRole('button', { name: /Registrar Fidelizado/ }))
    expect(screen.getByTestId('page-inscripcion')).toBeInTheDocument()
  })
})
