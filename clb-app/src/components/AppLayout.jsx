import { Outlet, useNavigate } from 'react-router-dom'
import { MarcaCLB } from './AppHeader.jsx'
import { BottomNav } from './BottomNav.jsx'
import { Sidebar } from './Sidebar.jsx'
import { useToast } from './Toast.jsx'
import { Avatar } from './Avatar.jsx'
import { iniciales } from '../lib/format.js'
import { useAppState } from '../store/AppContext.jsx'

const TABS = [
  { path: '/app', icon: 'dashboard', label: 'Inicio' },
  { path: '/app/inscripcion', icon: 'person_add', label: 'Inscripción' },
  { path: '/app/recinto', icon: 'location_on', label: 'Recinto' },
  { path: '/app/carpeta', icon: 'folder_shared', label: 'Mi Carpeta' },
  { path: '/app/mas', icon: 'apps', label: 'Más' },
]

/**
 * Layout de las rutas /app/*: header fijo, contenido con Outlet y bottom nav (móvil)
 * o sidebar (desktop).
 */
export function AppLayout() {
  const navigate = useNavigate()
  const toast = useToast()
  const session = useAppState((s) => s.session)

  return (
    <div className="min-h-dvh bg-clb-surface">
      <header className="fixed inset-x-0 top-0 z-50 bg-clb-surface/90 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[440px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clb-primary font-display text-sm font-bold shadow-md text-white">
              <span className="tracking-tighter">CLB</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-2.5 rounded-full bg-clb-primary" />
                <div className="h-1 w-2.5 rounded-full bg-clb-orange" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Territorio</span>
              </div>
              <span className="text-sm font-bold leading-none tracking-tight text-clb-primary">Carmen Ligia Barceló</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => toast.show('Sin notificaciones nuevas')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-clb-primary"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-clb-orange ring-2 ring-clb-surface" />
            </button>
            <button type="button" onClick={() => navigate('/app/perfil')} className="pl-1" aria-label="Ver perfil">
              <Avatar text={iniciales(session?.nombres, session?.apellidos)} size={34} tone="light" className="ring-2 ring-clb-primary/20" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-dvh w-full max-w-[440px] pb-24 pt-16 md:max-w-none md:px-0 md:pl-[240px]">
        <Sidebar items={TABS} />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      <BottomNav items={TABS} />
    </div>
  )
}

// MarcaCLB se re-exporta para conveniencia de consumidores del layout.
export { MarcaCLB }