import { NavLink } from 'react-router-dom'

/** Bottom nav de 5 pestañas con ruta activa. */
export function BottomNav({ items }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-white/95 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[440px] items-center justify-around px-1">
        {items.map((item) => (
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
