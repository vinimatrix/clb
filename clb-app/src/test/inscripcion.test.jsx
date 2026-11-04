import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import Inscripcion from '../pages/app/Inscripcion.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
})
afterEach(() => vi.useRealTimers())

function Page() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/inscripcion']}>
          <Inscripcion />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

/** Avanza el tiempo en trozos para que React aplique los efectos entre cada avance. */
function avanza(ms) {
  const pasos = Math.ceil(ms / 100)
  for (let i = 0; i < pasos; i++) {
    act(() => {
      vi.advanceTimersByTime(100)
    })
  }
}

function verificarCedula(ced) {
  fireEvent.change(screen.getByLabelText(/cédula de identidad/i), { target: { value: ced } })
  fireEvent.click(screen.getByRole('button', { name: /Verificar/ }))
  expect(screen.getByText('Elector Habilitado JCE')).toBeInTheDocument()
}

describe('Meta semanal', () => {
  it('muestra 38 inscritos hoy de 50 con 76% y faltan 12 para bono', () => {
    render(<Page />)
    expect(screen.getByText('38')).toBeInTheDocument()
    expect(screen.getByText('/ 50 electores')).toBeInTheDocument()
    expect(screen.getByText('76% completado')).toBeInTheDocument()
    expect(screen.getByText('Faltan 12 para bono')).toBeInTheDocument()
  })
})

describe('Verificación JCE', () => {
  it('escanear con cámara simula OCR y puebla la cédula', () => {
    vi.useFakeTimers()
    render(<Page />)
    fireEvent.click(screen.getByRole('button', { name: /Escanear Cédula con Cámara/ }))
    avanza(700)
    expect(screen.getByText('Elector Habilitado JCE')).toBeInTheDocument()
    const input = screen.getByLabelText(/cédula de identidad/i)
    expect(input.value).toMatch(/^\d{3}-\d{7}-\d{1}$/)
  })

  it('ingreso manual: verificar con cédula nueva puebla tarjeta JCE y grid de datos', () => {
    render(<Page />)
    verificarCedula('402-9998885-1')
    // Grid de datos poblado desde la JCE simulada
    expect(screen.getAllByText('Recinto').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mesa').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Orden').length).toBeGreaterThanOrEqual(1)
    // El form de identificación quedó poblado
    expect(screen.getByLabelText(/cédula de identidad/i).value).toBe('402-9998885-1')
  })
})

describe('Chips de fidelización', () => {
  it('single-select: Simpatizante deselecciona Fidelizado', () => {
    render(<Page />)
    const fid = screen.getByRole('button', { name: /Fidelizado/ })
    const sim = screen.getByRole('button', { name: /Simpatizante/ })
    fireEvent.click(fid)
    expect(fid.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(sim)
    expect(sim.getAttribute('aria-pressed')).toBe('true')
    expect(fid.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('Alta al padrón', () => {
  it('submit registra elector, suma métricas, muestra toast y aparece en Inscritos Recientemente', () => {
    const seed = buildSeed()
    render(<Page />)
    verificarCedula('402-9998885-1')
    fireEvent.click(screen.getByRole('button', { name: /Registrar e Inscribir Elector/ }))
    expect(screen.getByText('¡Elector inscrito exitosamente!')).toBeInTheDocument()
    // Persistencia: +1 elector, +1 inscrito en métricas
    const guardados = JSON.parse(localStorage.getItem('clb.electores'))
    expect(guardados).toHaveLength(seed.electores.length + 1)
    const metricas = JSON.parse(localStorage.getItem('clb.metricas'))
    expect(metricas.inscritos).toBe(seed.metricas.inscritos + 1)
    // Aparece en la lista de hoy con su cédula y acción WhatsApp
    expect(screen.getByText(/Inscritos Recientemente/)).toBeInTheDocument()
    expect(screen.getByText('402-9998885-1')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Enviar WhatsApp/).length).toBeGreaterThanOrEqual(1)
  })
})
