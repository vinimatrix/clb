import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { AppRouter } from '../App.jsx'
import Mas from '../pages/app/Mas.jsx'
import AdminPanel from '../pages/app/AdminPanel.jsx'

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
})

function MasPage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/mas']}>
          <Mas />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

function AdminPage() {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/app/admin']}>
          <AdminPanel />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}

describe('Admin Panel - solo Coordinador', () => {
  beforeEach(() => {
    localStorage.clear()
    const seed = buildSeed()
    save('clb.users', seed.users)
  })

  it('solo Coordinador ve la tarjeta Administración en Más', () => {
    // Dirigente no ve la tarjeta
    save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' })
    render(<MasPage />)
    expect(screen.queryByText('Administración')).not.toBeInTheDocument()

    // Coordinador sí ve la tarjeta
    const seed = buildSeed()
    save('clb.users', seed.users)
    localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' }))
    render(<MasPage />)
    expect(screen.getByText('Administración')).toBeInTheDocument()
  })

  it('AdminPanel muestra matriz de 2 roles x 5 módulos con toggles', () => {
    const seed = buildSeed()
    save('clb.users', seed.users)
    localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' }))
    
    render(<AdminPage />)
    
    // Verificar que se muestran los 2 roles (en las pestañas de rol)
    expect(screen.getAllByText('Coordinador')).toHaveLength(2) // tab + header
    expect(screen.getAllByText('Dirigente')).toHaveLength(2) // tab + header
    
    // Verificar que se muestran los 5 módulos
    expect(screen.getByText('Inscripción')).toBeInTheDocument()
    expect(screen.getByText('Mi Recinto')).toBeInTheDocument()
    expect(screen.getByText('Mi Carpeta')).toBeInTheDocument()
    expect(screen.getByText('CBA')).toBeInTheDocument()
    expect(screen.getByText('CBE')).toBeInTheDocument()
    
    // Verificar que hay toggles (switches) - 10 total (2 roles x 5 módulos)
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBe(10) // 2 roles x 5 módulos
  })

  it('cambiar toggle persiste en localStorage clb.permisos', () => {
    const seed = buildSeed()
    save('clb.users', seed.users)
    localStorage.setItem('clb.session', JSON.stringify({ cedula: '402-1234567-9', username: 'coord1', role: 'coordinador', nombres: 'Ana', apellidos: 'García' }))
    
    render(<AdminPage />)
    
    // Cambiar el toggle de CBA para Dirigente (que está false por defecto)
    const cbaDirigenteToggle = screen.getByRole('switch', { name: /Dirigente.*CBA/ })
    fireEvent.click(cbaDirigenteToggle)
    
    // Verificar que persiste en localStorage
    const stored = JSON.parse(localStorage.getItem('clb.permisos'))
    expect(stored.dirigente.cba).toBe(true)
    
    // Verificar toast de confirmación
    expect(screen.getByTestId('toast')).toBeInTheDocument()
  })
})