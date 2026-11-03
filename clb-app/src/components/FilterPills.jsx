/** Pills de filtro segmentado: activo azul, con contador opcional. */
export function FilterPills({ options, active, onChange, className = '' }) {
  return (
    <div className={`no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 text-nowrap ${className}`}>
      {options.map((opt) => {
        const isActive = opt.id === active
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition-all ${
              isActive ? 'bg-clb-primary text-white' : 'bg-white text-clb-muted hover:bg-slate-50'
            }`}
          >
            {opt.label}
            {opt.count != null ? <span className={isActive ? 'ml-1' : 'ml-1 text-slate-400'}>({opt.count})</span> : null}
          </button>
        )
      })}
    </div>
  )
}
