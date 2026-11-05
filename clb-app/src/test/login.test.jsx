import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { AppRouter } from '../App.jsx'
import { load, save } from '../lib/storage.js'

beforeEach(() => localStorage.clear())
afterEach(() => vi.useRealTimers())

/** Avanza el tiempo en trozos para que React aplique los efectos entre cada avance. */
function avanza(ms) {
  const pasos = Math.ceil(ms / 100)
  for (let i = 0; i < pasos; i++) {
    act(() => {
      vi.advanceTimersByTime(100)
    })
  }
}

function llenarLogin(ced = '402-1234567-8', pass = 'ClbSegura2026@') {
  fireEvent.change(screen.getByLabelText(/cédula de identidad/i), { target: { value: ced } })
  const esCampoContrasena = (c, el) => /contraseña$/i.test(c) && el?.tagName === 'INPUT'
  fireEvent.change(screen.getByLabelText(esCampoContrasena), { target: { value: pass } })
}

describe('Login (Paso 8)', () => {
  it('muestra la ayuda demo con credenciales', () => {
    render(<AppRouter initialEntries={['/login']} />)
    expect(screen.getByText(/Demo:/i)).toBeInTheDocument()
    expect(screen.getByText(/402-1234567-8/)).toBeInTheDocument()
    expect(screen.getByText(/ClbSegura2026@/)).toBeInTheDocument()
  })

  it('"¿Olvidaste tu contraseña?" dispara el toast', () => {
    render(<AppRouter initialEntries={['/login']} />)
    fireEvent.click(screen.getByText(/¿Olvidaste tu contraseña?/i))
    expect(screen.getByText(/Disponible en la versión con backend/i)).toBeInTheDocument()
  })

  it('credenciales malas → error inline y sigue en /login', () => {
    render(<AppRouter initialEntries={['/login']} />)
    llenarLogin('402-1234567-8', 'MalaClave1!')
    fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/i }))
    expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('demo correcto → session en store y /app tras la validación', async () => {
    vi.useFakeTimers()
    render(<AppRouter initialEntries={['/login']} />)
    llenarLogin()
    await fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/i }))
    act(() => {
      vi.advanceTimersByTime(20) // flush del calendario de React Router bajo fake timers
    })
    expect(screen.getByTestId('page-validando')).toBeInTheDocument()
    avanza(6000)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
    expect(load('clb.session', null).username).toBe('clbarcelo2026')
    expect(load('clb.session', null).role).toBe('dirigente')
  })

  it('"O regístrate" → Crear una cuenta navega a /registro', () => {
    render(<AppRouter initialEntries={['/login']} />)
    expect(screen.getByText(/Crear una cuenta/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Crear una cuenta/i))
    expect(screen.getByTestId('page-registro')).toBeInTheDocument()
  })

  it('con sesión previa, /login redirige a /app', () => {
    const seed = buildSeed()
    save('clb.users', seed.users)
    save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
    render(<AppRouter initialEntries={['/login']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
  })
})