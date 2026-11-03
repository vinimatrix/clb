import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed.js'
import { AppRouter } from '../App.jsx'
import { save } from '../lib/storage.js'

function conSesion() {
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })
}

describe('guardas de sesión', () => {
  it('sin sesión, /app redirige a /login', () => {
    render(<AppRouter initialEntries={['/app']} />)
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('sin sesión, /app/callcenter también redirige', () => {
    render(<AppRouter initialEntries={['/app/callcenter']} />)
    expect(screen.getByTestId('page-login')).toBeInTheDocument()
  })

  it('con sesión, /app muestra el placeholder del dashboard', () => {
    conSesion()
    render(<AppRouter initialEntries={['/app']} />)
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument()
  })
})
