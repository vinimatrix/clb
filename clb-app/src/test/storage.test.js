import { beforeEach, describe, expect, it } from 'vitest'
import { load, save } from '../lib/storage.js'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('guarda y carga JSON', () => {
    save('clb.test', { a: 1 })
    expect(load('clb.test', null)).toEqual({ a: 1 })
  })
  it('devuelve fallback si la clave no existe', () => {
    expect(load('clb.inexistente', 'x')).toBe('x')
  })
  it('devuelve fallback si el JSON está corrupto', () => {
    localStorage.setItem('clb.corrupto', '{no-json')
    expect(load('clb.corrupto', 'f')).toBe('f')
  })
})
