import { createContext, useContext, useMemo, useRef, useSyncExternalStore } from 'react'
import { createStoreLogic } from './actions.js'
import { buildSeed } from '../data/seed.js'
import { load } from '../lib/storage.js'
import { setStoreRef } from '../registerSW.jsx'

const AppContext = createContext(null)

/** Hidrata el estado desde clb.*; siembra la demo si el storage está vacío. */
function initialState() {
  const seed = buildSeed()
  if (load('clb.users', null) == null) return seed
  return {
    session: load('clb.session', null),
    registro: load('clb.registro', null),
    otp: load('clb.otp', null),
    users: load('clb.users', seed.users),
    electores: load('clb.electores', seed.electores),
    comites: load('clb.comites', seed.comites),
    metricas: load('clb.metricas', seed.metricas),
    tareas: load('clb.tareas', seed.tareas),
    llamadas: load('clb.llamadas', seed.llamadas),
    incidencias: load('clb.incidencias', seed.incidencias),
    recinto: load('clb.recinto', seed.recinto),
    permisos: load('clb.permisos', seed.permisos),
    offlineQueue: load('clb.offlineQueue', []),
    online: load('clb.online', true),
  }
}

export function AppProvider({ children }) {
  const storeRef = useRef(null)
  if (storeRef.current == null) {
    storeRef.current = createStoreLogic(initialState(), true)
  }
  const store = storeRef.current
  const versionRef = useRef(0)
  const listenersRef = useRef(new Set())

  const value = useMemo(() => {
    const listeners = listenersRef.current
    const notify = () => {
      versionRef.current += 1
      listeners.forEach((l) => l(versionRef.current))
    }
    const subscribe = (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
    const getSnapshot = () => versionRef.current

    // Proxy de actions: notifica a los suscriptores tras cada llamada MUTANTE.
    // Funciones de solo lectura (tienePermiso) no disparan notify.
    const READ_ONLY_ACTIONS = new Set(['tienePermiso'])
    const actions = {}
    for (const [name, fn] of Object.entries(store)) {
      if (typeof fn !== 'function' || name === 'getState') continue
      if (READ_ONLY_ACTIONS.has(name)) {
        actions[name] = fn.bind(store)
      } else {
        actions[name] = (...args) => {
          const result = fn.apply(store, args)
          notify()
          return result
        }
      }
    }
    return { actions, subscribe, getSnapshot, getState: store.getState }
  }, [store])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

/** Hook de suscripción: re-renderiza cuando el store muta y devuelve el estado. */
export function useAppState(selector = (s) => s) {
  const { subscribe, getSnapshot, getState } = useApp()
  useSyncExternalStore(subscribe, getSnapshot)
  return selector(getState())
}
