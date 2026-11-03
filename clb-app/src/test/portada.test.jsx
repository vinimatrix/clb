import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppRouter } from '../App.jsx'

describe('Portada', () => {
  it('muestra slogan, badge de provincia y acciones', () => {
    render(<AppRouter initialEntries={['/']} />)
    expect(screen.getByText(/Trabajemos/i)).toBeInTheDocument()
    expect(screen.getByText(/Hato Mayor/i)).toBeInTheDocument()
    expect(screen.getByText(/Gente organizada/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unirme al proyecto/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument()
  })

  it('"Iniciar sesión" navega a /login', () => {
    render(<AppRouter initialEntries={['/']} />)
    fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/i }))
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('"¡Unirme al proyecto!" navega al registro', () => {
    render(<AppRouter initialEntries={['/']} />)
    fireEvent.click(screen.getByRole('button', { name: /Unirme al proyecto/i }))
    expect(screen.getByTestId('page-registro')).toBeInTheDocument()
  })
})
