/**
 * Service Worker para CLB App - PWA
 * Estrategia: Cache-first para assets estáticos, Network-first para API
 */

const CACHE_NAME = 'clb-app-v1'
const STATIC_CACHE = 'clb-static-v1'
const API_CACHE = 'clb-api-v1'

// Archivos estáticos a precachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/manifest.json',
]

// Instalación: precachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activación: limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => {
            return cacheName !== STATIC_CACHE && cacheName !== API_CACHE
          }).map((cacheName) => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Estrategia para peticiones a API (localhost o dominio de API)
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar respuesta para cachear
          const responseClone = response.clone()
          caches.open(API_CACHE).then((cache) => cache.put(request, responseClone))
          return response
        })
        .catch(() => {
          // Si falla la red, intentar servir desde cache
          return caches.match(request)
        })
    )
    return
  }

  // Estrategia para assets estáticos: Cache-first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request)
          .then((response) => {
            // Solo cachear respuestas válidas
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone))
            }
            return response
          })
      })
  )
})

// Sincronización en segundo plano para acciones pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-electores') {
    event.waitUntil(syncElectores())
  }
})

async function syncElectores() {
  const cache = await caches.open(API_CACHE)
  const requests = await cache.keys()
  for (const request of requests) {
    try {
      await fetch(request)
    } catch (err) {
      // Si sigue fallando, dejar en cola para el próximo intento
      console.log('Sincronización pendiente:', request.url)
    }
  }
}