import { describe, expect, it } from 'vitest'
import {
  digitsOnly,
  formatNumber,
  iniciales,
  maskCedula,
  maskCedulaOculta,
  maskTelefono,
} from '../lib/format.js'

describe('maskCedula', () => {
  it('formatea 11 dígitos como 402-1234567-8', () => {
    expect(maskCedula('40212345678')).toBe('402-1234567-8')
  })
  it('formatea parcialmente mientras se escribe', () => {
    expect(maskCedula('4021234')).toBe('402-1234')
    expect(maskCedula('402')).toBe('402-')
  })
  it('ignora caracteres no numéricos', () => {
    expect(maskCedula('4a0b2')).toBe('402-')
  })
})

describe('digitsOnly', () => {
  it('deja solo dígitos con máximo', () => {
    expect(digitsOnly('a1b2c3', 4)).toBe('123')
  })
})

describe('maskTelefono', () => {
  it('formatea 10 dígitos como 829-450-8912', () => {
    expect(maskTelefono('8294508912')).toBe('829-450-8912')
  })
})

describe('formatNumber', () => {
  it('agrupa miles estilo mocks', () => {
    expect(formatNumber(245678)).toBe('245,678')
    expect(formatNumber(8873889)).toBe('8,873,889')
  })
})

describe('iniciales', () => {
  it('primera letra del nombre y del apellido', () => {
    expect(iniciales('Juan', 'Pérez')).toBe('JP')
  })
})

describe('maskCedulaOculta', () => {
  it('enmascara mostrando 3 primeros y verificadores', () => {
    expect(maskCedulaOculta('402-1234567-8')).toBe('402-******7-8')
  })
})
