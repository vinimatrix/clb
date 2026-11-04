import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save, load } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import Cba from '../pages/app/Cba.jsx'
import Cbe from '../pages/app/Cbe.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})

function CbaPage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/cba']}>
          <Cba />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

function CbePage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/cbe']}>
          <Cbe />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('CBA — celdas afectivas', () => {
  it('hero y KPIs del seed', () => {
    render(<CbaPage />)
    expect(screen.getByText('6 CBA')).toBeInTheDocument()
    expect(screen.getByText('82% Asegurado')).toBeInTheDocument()
    expect(screen.getByText('48 Electores')).toBeInTheDocument()
    expect(screen.getByText('39')).toBeInTheDocument() // voto seguro
    expect(screen.getByText('9')).toBeInTheDocument() // por visitar
  })

  it('muestra las 6 tarjetas CBA', () => {
    render(<CbaPage />)
    expect(screen.getAllByTestId('cba-card')).toHaveLength(6)
  })

  it('crear un CBA nuevo lo agrega a la lista (7) y persiste', () => {
    render(<CbaPage />)
    fireEvent.click(screen.getByRole('button', { name: /Crear Nuevo CBA/ }))
    fireEvent.change(screen.getByLabelText(/Nombre de la familia/i), { target: { value: 'Familia Prueba' } })
    fireEvent.change(screen.getByLabelText(/^Líder/i), { target: { value: 'Ana Prueba' } })
    fireEvent.change(screen.getByLabelText(/^Cédula/i), { target: { value: '027-9997778-9' } })
    fireEvent.change(screen.getByLabelText(/^Sector/i), { target: { value: 'Las Malvinas' } })
    fireEvent.change(screen.getByLabelText(/Recinto \/ Mesa/i), { target: { value: 'Escuela Andrés Bello (Mesa 0005)' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear CBA/ }))
    expect(screen.getAllByTestId('cba-card')).toHaveLength(7)
    expect(screen.getByText('Familia Prueba')).toBeInTheDocument()
    const comites = JSON.parse(localStorage.getItem('clb.comites'))
    expect(comites.some((c) => c.nombre === 'Familia Prueba')).toBe(true)
  })
})

describe('CBE — estructura electoral', () => {
  it('cinta de cobertura y KPIs del seed', () => {
    render(<CbePage />)
    expect(screen.getByText('92% Lista')).toBeInTheDocument()
    expect(screen.getByText('11 de 12 Mesas Cubiertas')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('/24')).toBeInTheDocument()
    expect(screen.getByText('91.6%')).toBeInTheDocument()
    expect(screen.getByText('640')).toBeInTheDocument() // voto duro
    expect(screen.getByText('85.3%')).toBeInTheDocument()
  })

  it('muestra las 12 tarjetas CBE', () => {
    render(<CbePage />)
    expect(screen.getAllByTestId('cbe-card')).toHaveLength(12)
  })

  it('CBE-028 está en falta de suplente y con "Sin Designar"', () => {
    render(<CbePage />)
    const card = screen.getAllByTestId('cbe-card').find((c) => c.textContent.includes('CBE-028'))
    expect(card).toBeDefined()
    expect(card.textContent).toContain('Sin Designar')
    expect(card.textContent).toContain('Falta Suplente')
  })

  it('Asignar Suplente cambia delegado y estado a blindado', () => {
    render(<CbePage />)
    const card = screen.getAllByTestId('cbe-card').find((c) => c.textContent.includes('CBE-028'))
    fireEvent.click(card.querySelector('button[data-accion="asignar-suplente"]'))
    fireEvent.change(screen.getByLabelText(/Nombre del suplente/i), { target: { value: 'Luis Pérez' } })
    fireEvent.click(screen.getByRole('button', { name: /Guardar suplente/ }))
    // El suplente quedó asignado
    const comites = JSON.parse(localStorage.getItem('clb.comites'))
    const cbe28 = comites.find((c) => c.codigo === 'CBE-028')
    expect(cbe28.delegados.suplente).toBe('Luis Pérez')
    expect(cbe28.estado).toBe('blindado')
    // El pill de falta de suplente baja a 1
    fireEvent.click(screen.getByRole('button', { name: /Falta Suplente/ }))
    expect(screen.getAllByTestId('cbe-card')).toHaveLength(1)
  })

  it('crear un CBE nuevo lleva la lista a 13', () => {
    render(<CbePage />)
    fireEvent.click(screen.getByRole('button', { name: /Crear Nuevo Comité CBE/ }))
    fireEvent.change(screen.getByLabelText(/Nombre del comité/i), { target: { value: 'Comité Prueba' } })
    fireEvent.change(screen.getByLabelText(/^Presidente/i), { target: { value: 'Dr. Prueba' } })
    fireEvent.change(screen.getByLabelText(/^Cédula/i), { target: { value: '027-9997778-9' } })
    fireEvent.change(screen.getByLabelText(/^Recinto/i), { target: { value: 'Liceo Bernardo Pichardo' } })
    fireEvent.change(screen.getByLabelText(/^Mesa/i), { target: { value: '0011' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear CBE/ }))
    expect(screen.getAllByTestId('cbe-card')).toHaveLength(13)
    expect(screen.getByText('Comité Prueba')).toBeInTheDocument()
    const comites = load('clb.comites', [])
    expect(comites.filter((c) => c.tipo === 'CBE')).toHaveLength(13)
    expect(comites.some((c) => c.nombre === 'Comité Prueba')).toBe(true)
  })
})
