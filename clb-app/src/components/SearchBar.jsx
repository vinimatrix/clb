import { Icon } from './Icon.jsx'

export function SearchBar({ placeholder = 'Buscar...', value, onChange, onClear, rightIcon }) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-clb-muted">
        <Icon name="search" size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl bg-white pl-10 pr-10 text-sm text-clb-primary shadow-card outline-none placeholder:text-clb-muted focus:ring-2 focus:ring-clb-primary"
      />
      {onClear && value ? (
        <button type="button" aria-label="Limpiar búsqueda" onClick={onClear} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-clb-muted hover:text-clb-primary">
          <Icon name="cancel" size={18} />
        </button>
      ) : rightIcon ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-clb-muted">{rightIcon}</div>
      ) : null}
    </div>
  )
}
