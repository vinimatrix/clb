/**
 * Registro del Service Worker para PWA
 * Solo se activa en entorno de producción (no en desarrollo con Vite HMR)
 */

let storeRef = null

export function setStoreRef(store) {
  storeRef = store
}

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/src/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registrado con éxito:', registration.scope)

          // Detectar actualización del Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Nueva versión disponible, recargar para aplicar
                    console.log('Nueva versión del SW disponible, recargando...')
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Error al registrar el Service Worker:', error)
        })
    })
  }

  // Detectar cambios de conectividad
  window.addEventListener('online', () => {
    console.log('Conexión restaurada - procesando cola offline')
    if (storeRef) {
      storeRef.current?.actions?.setOnline(true)
      storeRef.current?.actions?.flushOfflineQueue()
    }
    // Registrar sync para background sync
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.sync?.register('sync-electores').catch(() => {})
      })
    }
  })

  window.addEventListener('offline', () => {
    console.log('Sin conexión - modo offline activado')
    if (storeRef) {
      storeRef.current?.actions?.setOnline(false)
    }
  })
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister()
    })
  }
}