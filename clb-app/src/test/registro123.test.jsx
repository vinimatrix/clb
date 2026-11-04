import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '../App.jsx'
import { buildSeed } from '../data/seed.js'
import { load, save } from '../lib/storage.js'

beforeEach(() => localStorage.clear())

/** Siembra draft de registro + users para entrar directo al Paso 4. */
function conRegistroEnCurso() {
  save('clb.users', buildSeed().users)
  save('clb.registro', {
    cedula: '031-9999999-9', nombres: 'Ana', primerApellido: 'Prueba',
    segundoApellido: '', telefono: '829-555-0000',
  })
}

function llenarFormulario() {
  fireEvent.change(screen.getByPlaceholderText('Ej. 00112345678'), { target: { value: '03199999999' } })
  fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByPlaceholderText('Tu primer apellido'), { target: { value: 'Prueba' } })
  fireEvent.change(screen.getByPlaceholderText('(829) 123-4567'), { target: { value: '8295550000' } })
}

describe('Paso 2 — Unirme al Proyecto', () => {
  it('submit vacío muestra requeridos y no navega', () => {
    render(<AppRouter initialEntries={['/registro']} />)
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getAllByText(/campo requerido|requerido/i).length).toBeGreaterThan(0)
    expect(screen.getByTestId('page-registro')).toBeInTheDocument()
  })

  it('cédula ya registrada muestra el error exacto', () => {
    render(<AppRouter initialEntries={['/registro']} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. 00112345678'), { target: { value: '40212345678' } })
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByPlaceholderText('Tu primer apellido'), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByPlaceholderText('(829) 123-4567'), { target: { value: '8294508912' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByText('Esta cédula ya está registrada. Inicia sesión.')).toBeInTheDocument()
    expect(screen.getByTestId('page-registro')).toBeInTheDocument()
  })

  it('datos nuevos avanzan a confirmación con cédula enmascarada', () => {
    render(<AppRouter initialEntries={['/registro']} />)
    llenarFormulario()
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByTestId('page-confirmacion')).toBeInTheDocument()
    expect(screen.getByText(/031-\*\*\*\*\*\*9-9/)).toBeInTheDocument()
    expect(screen.getByText(/Cédula Válida/i)).toBeInTheDocument()
  })
})

describe('Paso 4 — Crear Usuario', () => {
  it('username corto: badge ámbar y botón deshabilitado', () => {
    conRegistroEnCurso()
    render(<AppRouter initialEntries={['/registro/usuario']} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. clbarcelo2026'), { target: { value: 'clb' } })
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled()
  })

  it('username tomado: badge rojo "Usuario no disponible"', () => {
    conRegistroEnCurso()
    render(<AppRouter initialEntries={['/registro/usuario']} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. clbarcelo2026'), { target: { value: 'clbarcelo2026' } })
    expect(screen.getByText('Usuario no disponible')).toBeInTheDocument()
  })

  it('username disponible habilita y avanza a OTP', () => {
    conRegistroEnCurso()
    render(<AppRouter initialEntries={['/registro/usuario']} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. clbarcelo2026'), { target: { value: 'nuevo2026' } })
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(screen.getByTestId('page-otp')).toBeInTheDocument()
  })

  it('el draft de registro persiste en localStorage al avanzar', () => {
    conRegistroEnCurso()
    render(<AppRouter initialEntries={['/registro/usuario']} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. clbarcelo2026'), { target: { value: 'nuevo2026' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    expect(load('clb.registro', null).username).toBe('nuevo2026')
  })
})
