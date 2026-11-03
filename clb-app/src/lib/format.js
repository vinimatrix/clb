/** Utilidades de formato para CLB App. */

/** Deja solo dígitos, con máximo opcional. */
export function digitsOnly(value, max = 11) {
  const d = String(value ?? '').replace(/\D/g, '')
  return max == null ? d : d.slice(0, max)
}

/** Formatea cédula dominicana 3-7-1 mientras se escribe: 402-1234567-8 */
export function maskCedula(value) {
  const d = digitsOnly(value, 11)
  if (d.length === 0) return ''
  let out = d.slice(0, 3)
  if (d.length >= 3) out += '-'
  if (d.length > 3) out += d.slice(3, 10)
  if (d.length > 10) out += '-' + d.slice(10, 11)
  return out
}

/** Enmascara una cédula completa: 402-1234567-8 → 402-******7-8 */
export function maskCedulaOculta(cedula) {
  const d = digitsOnly(cedula, 11)
  if (d.length < 11) return cedula
  return `${d.slice(0, 3)}-******${d.slice(9, 10)}-${d.slice(10, 11)}`
}

/** Formatea teléfono 10 dígitos: 829-450-8912 */
export function maskTelefono(value) {
  const d = digitsOnly(value, 10)
  let out = d.slice(0, 3)
  if (d.length > 3) out += '-' + d.slice(3, 6)
  if (d.length > 6) out += '-' + d.slice(6, 10)
  return out
}

/** Números con agrupación de miles como en los mocks: 245,678 */
export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Number(n ?? 0))
}

/** Iniciales: primer nombre + primer apellido, mayúsculas. */
export function iniciales(nombres, apellidos) {
  const a = String(nombres ?? '').trim().charAt(0)
  const b = String(apellidos ?? '').trim().charAt(0)
  return (a + b).toUpperCase()
}
