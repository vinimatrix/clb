import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider, useAppState, useApp } from '../store/AppContext.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'coordinador', nombres: 'Juan', apellidos: 'Pérez' })
})

function renderStore(children) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

describe('store - permisos y roles', () => {
  it('expone state.permisos desde la semilla', () => {
    function TestComp() {
      const { permisos } = useAppState()
      return <div data-testid="permisos">{JSON.stringify(permisos)}</div>
    }
    render(<AppProvider><TestComp /></AppProvider>)
    expect(screen.getByTestId('permisos').textContent).toContain('inscripcion')
  })

  it('tienePermiso devuelve true para módulos permitidos al coordinador', () => {
    function TestComp() {
      const { tienePermiso } = useApp().actions
      const result = tienePermiso('inscripcion')
      return <div data-testid="tiene">{String(result)}</div>
    }
    render(<AppProvider><TestComp /></AppProvider>)
    expect(screen.getByTestId('tiene').textContent).toBe('true')
  })

  it('tienePermiso devuelve false para módulos inexistentes', () => {
    function TestComp() {
      const { tienePermiso } = useApp().actions
      const result = tienePermiso('modulo_inexistente')
      return <div data-testid="tiene">{String(result)}</div>
    }
    render(<AppProvider><TestComp /></AppProvider>)
    expect(screen.getByTestId('tiene').textContent).toBe('false')
  })

  it('actualizarPermiso cambia el permiso y persiste en localStorage', () => {
    function TestComp() {
      const { actualizarPermiso } = useApp().actions
      actualizarPermiso('coordinador', 'cba', true)
      return <div data-testid="ok">ok</div>
    }
    render(<AppProvider><TestComp /></AppProvider>)
    expect(screen.getByTestId('ok')).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem('clb.permisos'))
    expect(stored.coordinador.cba).toBe(true)
  })
})