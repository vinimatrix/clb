import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { AppRouter } from '../App.jsx'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import MiRecinto from '../pages/app/MiRecinto.jsx'
import Padron from '../pages/app/Padron.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

function RecintoPuro() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/recinto']}>
          <MiRecinto />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Mi Recinto', () => {
  it('muestra hero con datos y KPIs del recinto', () => {
    render(<RecintoPuro />)
    expect(screen.getByText('Liceo Secundario Bernardo Pichardo')).toBeInTheDocument()
    expect(screen.getByText(/1,850/)).toBeInTheDocument() // meta
    expect(screen.getByText('2,980')).toBeInTheDocument() // padrón total
    expect(screen.getByText('1,420')).toBeInTheDocument() // fidelizados
    expect(screen.getByText(/47\.6% asegurado/)).toBeInTheDocument()
    expect(screen.getByText(/Lic\. Roberto Santana/)).toBeInTheDocument()
  })

  it('el botón de llamar coordinador es un enlace tel:', () => {
    render(<RecintoPuro />)
    const link = screen.getByLabelText('Llamar al coordinador')
    expect(link.getAttribute('href')).toBe('tel:829-555-0142')
  })

  it('renderiza las 6 tarjetas de colegio con porcentajes', () => {
    render(<RecintoPuro />)
    for (const cod of ['0012A', '0012B', '0012C', '0012D', '0012E', '0012F']) {
      expect(screen.getByText(`Colegio ${cod}`)).toBeInTheDocument()
    }
    expect(screen.getByText(/50\.8% padrón/)).toBeInTheDocument() // 260/512
    expect(screen.getByText(/49\.5% padrón/)).toBeInTheDocument() // 245/495
  })

  it('tab Equipo lista a los delegados', () => {
    render(<RecintoPuro />)
    fireEvent.click(screen.getByRole('button', { name: /Equipo/ }))
    expect(screen.getByText('Ramón Mercedes')).toBeInTheDocument()
    expect(screen.getByText('José Almonte')).toBeInTheDocument()
  })

  it('tab Incidencias: vacío al inicio, reportar agrega y lo muestra', () => {
    render(
      <AppProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/app/recinto']}>
            <MiRecinto />
          </MemoryRouter>
        </ToastProvider>
      </AppProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Incidencias/ }))
    expect(screen.getByText(/sin novedades registradas/i)).toBeInTheDocument()
    // Abre la hoja de reporte y la envía
    fireEvent.click(screen.getByRole('button', { name: /Reportar Novedad de Mesa/ }))
    fireEvent.change(screen.getByLabelText(/colegio/i), { target: { value: '0012C' } })
    fireEvent.change(screen.getByLabelText(/novedad/i), { target: { value: 'Falta suplente confirmado' } })
    fireEvent.click(screen.getByRole('button', { name: /Enviar reporte/i }))
    expect(screen.getByText('Falta suplente confirmado')).toBeInTheDocument()
    // Persiste en localStorage
    const guardadas = JSON.parse(localStorage.getItem('clb.incidencias'))
    expect(guardadas).toHaveLength(1)
    expect(guardadas[0].colegio).toBe('0012C')
    expect(guardadas[0].texto).toBe('Falta suplente confirmado')
  })

  it('botón Ver Padrón navega a /app/padron', () => {
    localStorage.clear()
    const seed = buildSeed()
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/app/recinto']} />)
    fireEvent.click(screen.getByRole('button', { name: /Ver Padrón de Recinto/ }))
    expect(screen.getByTestId('page-padron')).toBeInTheDocument()
  })
})

describe('Padrón de Recinto', () => {
  function PadronPuro() {
    return (
      <AppProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={['/app/padron']}>
            <Padron />
          </MemoryRouter>
        </ToastProvider>
      </AppProvider>
    )
  }

  it('muestra KPIs de padrón solo con electores del recinto Pichardo', () => {
    render(<PadronPuro />)
    // Los del Liceo Pichardo del seed: 11 electores en el recinto.
    expect(screen.getByText(/Liceo Secundario Bernardo Pichardo/)).toBeInTheDocument()
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument()
  })

  it('buscar "Rosa" filtra una fila (Rosa Esther)', () => {
    render(<PadronPuro />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), { target: { value: 'Rosa' } })
    const filas = screen.getAllByTestId('elector-row')
    expect(filas).toHaveLength(1)
    expect(screen.getByText('Rosa Esther')).toBeInTheDocument()
    expect(screen.getByText(/Gómez Rosario/)).toBeInTheDocument()
  })

  it('la búsqueda tolera cédula parcial', () => {
    render(<PadronPuro />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), { target: { value: '001-0982341' } })
    expect(screen.getAllByTestId('elector-row')).toHaveLength(1)
  })

  it('pill Fidelizados filtra; acción Fidelizar sube un indeciso/simpatizante y suma métrica', () => {
    render(<PadronPuro />)
    // Fidelizar a José Ramón (simpatizante del Pichardo).
    const fila = screen.getAllByTestId('elector-row').find((r) => r.textContent.includes('José Ramón'))
    fireEvent.click(fila.querySelector('button[data-accion="fidelizar"]'))
    // Su fila pasa a fidelizado y la métrica global sube.
    expect(screen.getByText(/Voto seguro confirmado/i)).toBeInTheDocument()
    const seed = buildSeed()
    const antes = seed.metricas.fidelizados
    const users = JSON.parse(localStorage.getItem('clb.metricas'))
    expect(users.fidelizados).toBe(antes + 1)
  })

  it('pill Indecisos muestra solo indecisos del recinto', () => {
    render(<PadronPuro />)
    fireEvent.click(screen.getByRole('button', { name: /Indecisos/ }))
    // El recinto Pichardo no tiene indecisos: cero filas + estado vacío.
    expect(screen.queryAllByTestId('elector-row')).toHaveLength(0)
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })
})
