import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Mock de QrScanner para tests (usa html5-qrcode que no funciona en jsdom)
vi.mock('../../components/QrScanner.jsx', () => ({
  default: ({ onScan, autoClose }) => {
    // Auto-simular escaneo después de 500ms si autoClose está activado
    if (autoClose && onScan) {
      setTimeout(() => {
        onScan('40299988851') // cédula de prueba de 11 dígitos
      }, 500)
    }
    return (
      <div data-testid="qr-scanner-mock">
        <span className="material-symbols-outlined text-[48px] text-slate-400">qr_code</span>
        <button
          type="button"
          onClick={() => onScan && onScan('40299988851')}
          className="mt-2 text-xs underline"
        >
          Simular escaneo
        </button>
      </div>
    )
  },
}))

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { buildSeed } from '../data/seed.js'
import { save } from '../lib/storage.js'
import { AppProvider } from '../store/AppContext.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import Inscripcion from '../pages/app/Inscripcion.jsx'

// Mock de fetch para la API de verificación de cédula
// Se asigna directamente a globalThis para que se resuelva en tiempo de ejecución
const mockVerifyResponse = {
  existe: true,
  nombres: 'Rosa Esther',
  apellidos: 'Gómez Rosario',
}

beforeEach(() => {
  localStorage.clear()
  const seed = buildSeed()
  save('clb.users', seed.users)
  save('clb.session', { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'Miembro', nombres: 'Juan', apellidos: 'Pérez' })

  // Mock global de fetch para la API de verificación de cédula
  globalThis.fetch = async (url) => {
    const urlStr = String(url)
    if (urlStr.includes('/electores/verificar/')) {
      return {
        ok: true,
        status: 200,
        json: async () => mockVerifyResponse,
      }
    }
    // Para cualquier otra llamada a la API, retornar error (fallback a localStorage)
    return {
      ok: false,
      status: 503,
      json: async () => null,
    }
  }
})
afterEach(() => {
  vi.useRealTimers()
  delete globalThis.fetch
})

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

async function verificarCedula(ced) {
  fireEvent.change(screen.getByLabelText(/cédula de identidad/i), { target: { value: ced } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Verificar/ }))
  })
  // Esperar a que se resuelva la promesa async y React procese la actualización de estado
  await new Promise((resolve) => setTimeout(resolve, 150))
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
  it('escanear con cámara simula OCR y puebla la cédula', async () => {
    render(<Page />)
    // Simular el resultado de un escaneo de cédula válida (11 dígitos)
    await verificarCedula('40299988851')
    // La cédula formateada debe estar en el input
    const input = screen.getByLabelText(/cédula de identidad/i)
    expect(input.value).toMatch(/^\d{3}-\d{7}-\d{1}$/)
    // El nombre debe aparecer (datos mínimos de la API, hardening de seguridad)
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Rosa Esther Gómez Rosario'))).toBeInTheDocument()
    })
    // No deben aparecer datos sensibles adicionales (recinto, mesa, orden)
    expect(screen.queryByText(/Recinto/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Mesa/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Orden/)).not.toBeInTheDocument()
  })

  it('ingreso manual: verificar con cédula nueva puebla nombres y apellidos', async () => {
    render(<Page />)
    await verificarCedula('402-9998885-1')
    // Solo nombres y apellidos (datos mínimos, hardening de seguridad)
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Rosa Esther Gómez Rosario'))).toBeInTheDocument()
    })
    // El form de identificación quedó poblado con la cédula
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
  it('submit registra elector, suma métricas, muestra toast y aparece en Inscritos Recientemente', async () => {
    const seed = buildSeed()
    render(<Page />)
    await verificarCedula('402-9998885-1')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Registrar e Inscribir Elector/ }))
    })
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
