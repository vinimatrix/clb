/**
 * Hash simple determinista para la demo sin backend.
 * NO es criptografía real: solo evita guardar la contraseña en claro.
 */
export function simpleHash(password) {
  const str = 'clb:' + String(password ?? '')
  try {
    // btoa falla con caracteres no latinos; escape/unescape los maneja.
    return btoa(unescape(encodeURIComponent(str)))
  } catch {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i)
      h |= 0
    }
    return String(h)
  }
}

export function verifyPassword(password, storedHash) {
  return simpleHash(password) === storedHash
}
