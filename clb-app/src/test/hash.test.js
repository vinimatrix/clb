import { describe, expect, it } from 'vitest'
import { simpleHash, verifyPassword } from '../lib/hash.js'

describe('hash', () => {
  it('verifica la contraseña correcta', () => {
    const stored = simpleHash('ClbSegura2026@')
    expect(verifyPassword('ClbSegura2026@', stored)).toBe(true)
  })
  it('rechaza una contraseña distinta', () => {
    const stored = simpleHash('ClbSegura2026@')
    expect(verifyPassword('OtraClave1!', stored)).toBe(false)
  })
  it('es determinista', () => {
    expect(simpleHash('abc')).toBe(simpleHash('abc'))
  })
})
