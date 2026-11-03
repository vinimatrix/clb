/** Persistencia JSON en localStorage con prefijo clb.* y fallback seguro. */

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento lleno o no disponible: la app sigue en memoria */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}
