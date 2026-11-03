import { createContext, useCallback, useContext, useState } from 'react'
import { Icon } from './Icon.jsx'

const ToastContext = createContext(null)

/** Proveedor de toasts: useToast().show(mensaje, tone). */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const show = useCallback((message, tone = 'dark') => {
    setToast({ message, tone, id: Date.now() })
    window.clearTimeout(show._t)
    show._t = window.setTimeout(() => setToast(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <div className="fixed left-1/2 top-20 z-[60] -translate-x-1/2" data-testid="toast">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg ${
              toast.tone === 'green' ? 'bg-emerald-600 text-white' : 'bg-clb-ink text-white'
            }`}
          >
            <Icon name="check_circle" size={18} className="text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
