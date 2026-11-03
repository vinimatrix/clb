/** Píldora de indicador de paso ("Paso N de 7 · etiqueta"). */
export function StepBadge({ paso, total = 7, label, pulse = true }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-clb-primary">
      {pulse ? <span className="h-2 w-2 animate-pulse rounded-full bg-clb-orange" /> : null}
      <span>
        Paso {paso} de {total}
        {label ? `: ${label}` : ''}
      </span>
    </div>
  )
}
