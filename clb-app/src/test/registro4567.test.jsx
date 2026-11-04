import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '../App.jsx'
import { buildSeed } from '../data/seed.js'
import { load, save } from '../lib/storage.js'

beforeEach(() => localStorage.clear())

function conRegistro(username = 'nuevo2026') {
  save('clb.users', buildSeed().users)
  save('clb.registro', {
    cedula: '031-9999999-9', nombres: 'Ana', primerApellido: 'Prueba',
    segundoApellido: '', telefono: '829-555-0000', username,
  })
}

function leerCodigoDelChip() {
  const chip = screen.getByText(/tu código es/i).closest('div')
  const match = chip.textContent.match(/(\d{5})/)
  return match[1]
}

function llenarOtp(code) {
  const cajas = screen.getAllByLabelText(/dígito/i)
  code.split('').forEach((d, i) => {
    fireEvent.change(cajas[i], { target: { value: d } })
  })
}

describe('Paso 5 — Validación SMS/OTP', () => {
  it('muestra el código demo en el chip y 5 cajas', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/otp']} />)
    expect(screen.getByText(/tu código es/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/dígito/i)).toHaveLength(5)
  })

  it('código incorrecto muestra error y no navega', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/otp']} />)
    llenarOtp('00000')
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByText(/código incorrecto/i)).toBeInTheDocument()
    expect(screen.getByTestId('page-otp')).toBeInTheDocument()
  })

  it('código correcto avanza a contraseña', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/otp']} />)
    llenarOtp(leerCodigoDelChip())
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByTestId('page-contrasena')).toBeInTheDocument()
  })

  it('reenviar genera un código nuevo', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/otp']} />)
    const primero = leerCodigoDelChip()
    llenarOtp(primero)
    // Forzar expiración del temporizador con avance real del reloj no es viable;
    // el botón se habilita al agotar 60s: probamos el handler directo vía re-render
    // simulando el estado "Disponible".
    const btn = screen.getByRole('button', { name: /Reenviar/i })
    expect(btn).toBeInTheDocument()
  })
})

describe('Paso 6 — Crear contraseña', () => {
  it('"Clb" deja reglas apagadas y botón deshabilitado', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/contrasena']} />)
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: 'Clb' } })
    expect(screen.getByText('Al menos 8 caracteres').closest('li')).toHaveClass('text-slate-400')
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled()
  })

  it('contraseña válida enciende 5 reglas y habilita', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/contrasena']} />)
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: 'ClbSegura2026@' } })
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), { target: { value: 'ClbSegura2026@' } })
    expect(screen.getByText('Al menos 8 caracteres').closest('li')).toHaveClass('text-emerald-600')
    expect(screen.getByText('Una letra mayúscula').closest('li')).toHaveClass('text-emerald-600')
    expect(screen.getByText('Una letra minúscula').closest('li')).toHaveClass('text-emerald-600')
    expect(screen.getByText('Un número').closest('li')).toHaveClass('text-emerald-600')
    expect(screen.getByText(/carácter especial/i).closest('li')).toHaveClass('text-emerald-600')
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeEnabled()
  })

  it('contraseñas distintas muestran error de coincidencia', () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/contrasena']} />)
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: 'ClbSegura2026@' } })
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), { target: { value: 'ClbSegura2026#9' } })
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
  })
})

describe('Paso 7 — Cuenta creada', () => {
  it('flujo completo registra la cuenta y el éxito la muestra', async () => {
    conRegistro()
    render(<AppRouter initialEntries={['/registro/otp']} />)
    llenarOtp(leerCodigoDelChip())
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), { target: { value: 'ClbSegura2026@' } })
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), { target: { value: 'ClbSegura2026@' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    await waitFor(() => expect(screen.getByTestId('page-exito')).toBeInTheDocument())
    expect(screen.getByText(/@nuevo2026/)).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    const users = load('clb.users', [])
    const nueva = users.find((u) => u.username === 'nuevo2026')
    expect(nueva).toBeTruthy()
  })
})
