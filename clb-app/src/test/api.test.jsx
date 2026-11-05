import { describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api-client.js'

describe('API - api-client', () => {
  it('expone funciones de API', () => {
    expect(typeof api.login).toBe('function')
    expect(typeof api.getElectores).toBe('function')
    expect(typeof api.addElector).toBe('function')
    expect(typeof api.updateElector).toBe('function')
    expect(typeof api.deleteElector).toBe('function')
    expect(typeof api.getComites).toBe('function')
    expect(typeof api.addComite).toBe('function')
    return true
  })

  it('retorna null cuando USE_API es false', async () => {
    const result = await api.getElectores()
    expect(result).toBeNull()
  })
})