const TONES = {
  blue: 'bg-clb-primary',
  orange: 'bg-clb-orange',
  green: 'bg-emerald-600',
}

/** Barra de progreso con porcentaje 0-100. */
export function ProgressBar({ value, tone = 'blue', height = 'h-2', className = '' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-200 ${height} ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${TONES[tone]}`} style={{ width: `${v}%` }} />
    </div>
  )
}
