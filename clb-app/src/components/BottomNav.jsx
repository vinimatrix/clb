import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext.jsx'

/** Bottom nav de 5 pestañas con ruta activa, filtrado por permisos. */
export function BottomNav({ items }) {
  const { tienePermiso } = useApp().actions

  // Mapear paths a módulos de permisos
  const moduloPorPath = {
    '/app/inscripcion': 'inscripcion',
    '/app/recinto': 'miRecinto',
    '/app/carpeta': 'miCarpeta',
    '/app/fidelizados': 'fidelizados',
    // '/app/mas': 'mas' → no mapeado para que siempre sea visible (contenedor)
  }

  const visibleItems = items.filter((item) => {
    const modulo = moduloPorPath[item.path]
    if (!modulo) return true // Sin mapeo = siempre visible
    return tienePermiso(modulo)
  })

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/95 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[440px] items-center justify-around px-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex min-w-[56px] flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors ${
                isActive ? 'font-bold text-clb-primary' : 'text-clb-muted hover:text-clb-ink'
              } ${item.className ?? ''}`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
