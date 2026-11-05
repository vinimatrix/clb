import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext.jsx'

/** Sidebar de navegación para escritorio y tablet. Oculto en móvil. */
export function Sidebar({ items }) {
  const { tienePermiso } = useApp().actions

  const moduloPorPath = {
    '/app/inscripcion': 'inscripcion',
    '/app/recinto': 'miRecinto',
    '/app/carpeta': 'miCarpeta',
    '/app/fidelizados': 'fidelizados',
    '/app/cba': 'cba',
    '/app/cbe': 'cbe',
    '/app/callcenter': 'callcenter',
    // '/app/mas': 'mas' → no mapeado para que siempre sea visible (contenedor)
  }

  const visibleItems = items.filter((item) => {
    const modulo = moduloPorPath[item.path]
    if (!modulo) return true
    return tienePermiso(modulo)
  })

  return (
    <aside className="fixed inset-y-0 left-0 z-40 bg-white/95 w-[240px] shadow-[0_4px_6px_rgba(0,0,0,0.05)] hidden md:flex flex-col h-full border-r border-slate-200" data-testid="sidebar">
      <nav className="flex-1 flex-col overflow-y-auto p-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-clb-primary/10 text-clb-primary font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-clb-primary'
              } ${item.className ?? ''}`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}