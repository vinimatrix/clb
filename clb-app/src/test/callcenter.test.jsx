import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import CallCenter from '../pages/app/CallCenter.jsx'

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
        <MemoryRouter initialEntries={['/app/callcenter']}>
          <CallCenter />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Call Center — cuota y métricas', () => {
  it('muestra hero con cuota 42/60 (70%) y 18 restantes', () => {
    render(<Page />)
    expect(screen.getByText('Tele-Validación Electoral')).toBeInTheDocument()
    expect(screen.getByText(/^42$/)).toBeInTheDocument()
    expect(screen.getByText(/60 \(70%\)/)).toBeInTheDocument()
    expect(screen.getByText(/18 restantes/)).toBeInTheDocument()
  })

  it('muestra las 3 métricas bento del seed', () => {
    render(<Page />)
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
  })
})

describe('Dossier del elector', () => {
  it('"Iniciar Siguiente Asignada" abre el dossier del primer elector sin intento', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Siguiente Asignada/ }))
    expect(screen.getByText('Carmen Rosa Altagracia Silvestre')).toBeInTheDocument()
    expect(screen.getByText('027-0056192-0')).toBeInTheDocument()
    // Recinto / mesa del dossier
    expect(screen.getByText(/Mesa 0012B/)).toBeInTheDocument()
    // Botones de contacto con su número
    expect(screen.getByRole('link', { name: /Llamar/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /WhatsApp/ })).toBeInTheDocument()
  })

  it('la nota permite escribir y los chips son single-select', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Siguiente Asignada/ }))
    const seguro = screen.getByRole('button', { name: /Voto Seguro CLB/ })
    const simpatizante = screen.getByRole('button', { name: /Simpatizante/ })
    fireEvent.click(seguro)
    expect(seguro.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(simpatizante)
    expect(simpatizante.getAttribute('aria-pressed')).toBe('true')
    expect(seguro.getAttribute('aria-pressed')).toBe('false')
    // Horario single-select
    const manana = screen.getByRole('button', { name: /Mañana/ })
    const tarde = screen.getByRole('button', { name: /Tarde/ })
    fireEvent.click(manana)
    expect(manana.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(tarde)
    expect(tarde.getAttribute('aria-pressed')).toBe('true')
    expect(manana.getAttribute('aria-pressed')).toBe('false')
  })

  it('tipificar y Guardar suma cuota a 43, persiste y pasa al siguiente', () => {
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Siguiente Asignada/ }))
    fireEvent.click(screen.getByRole('button', { name: /Voto Seguro CLB/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ruta B-3/ }))
    fireEvent.click(screen.getByRole('button', { name: /Mañana/ }))
    fireEvent.click(screen.getByRole('button', { name: /Guardar y Pasar al Siguiente/ }))
    expect(screen.getByTestId('toast')).toBeInTheDocument()
    const llamadas = JSON.parse(localStorage.getItem('clb.llamadas'))
    expect(llamadas.completadasHoy).toBe(43)
    // La ficha activa pasa al siguiente elector sin intento
    expect(screen.getByText('Rosa Esther Gómez Rosario')).toBeInTheDocument()
    // e1 quedó tipificado
    const electores = JSON.parse(localStorage.getItem('clb.electores'))
    const e1 = electores.find((e) => e.id === 'e1')
    expect(e1.intento.intencion).toBe('voto-seguro')
    expect(e1.intento.transporte).toBe('ruta-b3')
    expect(e1.intento.horario).toBe('manana')
  })
})

describe('Cola prioritaria', () => {
  it('muestra las 3 tarjetas del seed', () => {
    render(<Page />)
    expect(screen.getByText('Manuel Antonio Castillo')).toBeInTheDocument()
    expect(screen.getByText('Clara Luz Berroa')).toBeInTheDocument()
    expect(screen.getByText('José David Mercedes')).toBeInTheDocument()
    expect(screen.getByText('Cola Prioritaria de Hoy')).toBeInTheDocument()
  })
})
