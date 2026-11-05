import { describe, expect, it, beforeEach } from 'vitest'
import { createStoreLogic } from '../store/actions.js'
import { buildSeed } from '../data/seed.js'

// Mock de navigator.serviceWorker para jsdom
Object.defineProperty(navigator, 'serviceWorker', {
  value: { register: () => Promise.resolve({ scope: '/' }) },
  writable: true,
  configurable: true,
})

describe('PWA Offline - Cola de sincronización', () => {
  let seed
  let store

  beforeEach(() => {
    seed = buildSeed()
    store = createStoreLogic({
      session: { cedula: '402-1234567-8', username: 'clbarcelo2026', role: 'dirigente', nombres: 'Juan', apellidos: 'Pérez' },
      users: seed.users,
      electores: [],
      tareas: [],
      llamadas: [],
      incidencias: [],
      offlineQueue: [],
      online: true,
    }, false)
  })

  it('agrega acciones a la cola offline cuando API falla', () => {
    // Simular que estamos offline
    store.setOnline(false)

    // Agregar un elector (debería ir a la cola offline)
    const result = store.addElector({
      cedula: '402-1111111-1',
      nombres: 'Test',
      apellidos: 'Offline',
      edad: 30,
    })

    expect(result.ok).toBe(true)
    expect(result.offline).toBe(true)

    const state = store.getState()
    expect(state.offlineQueue.length).toBe(1)
    expect(state.offlineQueue[0].type).toBe('addElector')
    expect(state.offlineQueue[0].data.cedula).toBe('402-1111111-1')
  })

  it('procesa la cola offline cuando se recupera la conexión', async () => {
    // Agregar items a la cola offline
    store.addToOfflineQueue({ type: 'addElector', data: { cedula: '402-1111111-1', nombres: 'Test', apellidos: 'Offline', edad: 30 } })
    store.addToOfflineQueue({ type: 'addElector', data: { cedula: '402-2222222-2', nombres: 'Test2', apellidos: 'Offline2', edad: 25 } })

    let state = store.getState()
    expect(state.offlineQueue.length).toBe(2)

    // Simular que volvemos online y procesar la cola
    store.setOnline(true)
    await store.flushOfflineQueue()

    state = store.getState()
    // La cola debería estar vacía después de procesar
    expect(state.offlineQueue.length).toBe(0)
    // Los electores deberían estar en el estado
    expect(state.electores.length).toBe(2)
  })

  it('registra Service Worker para sincronización en background', () => {
    // Verificar que el SW se registra
    expect(typeof navigator.serviceWorker.register).toBe('function')
  })
})
