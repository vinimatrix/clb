const ICON_TONES = {
  blue: 'bg-clb-blueLight text-clb-primary',
  orange: 'bg-clb-orangeLight text-clb-orange',
  navy: 'bg-blue-100 text-clb-navy',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-600',
}

const VALUE_TONES = {
  blue: 'text-clb-primary',
  orange: 'text-clb-orange',
  navy: 'text-clb-navy',
  green: 'text-emerald-700',
  red: 'text-clb-red',
}

const DELTA_TONES = {
  blue: 'bg-slate-100 text-clb-primary',
  orange: 'bg-clb-orangeLight text-[#7a3000]',
  green: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-slate-100 text-slate-500',
}

/** Tarjeta métrica ejecutiva: icono, valor grande, etiqueta y delta. */
export function MetricCard({ icon, tone = 'blue', value, label, sub, delta, deltaTone = 'gray', onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`w-full rounded-card bg-white p-3.5 text-left shadow-card ${onClick ? 'transition-transform active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>{icon}</div>
        {delta ? (
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${DELTA_TONES[deltaTone]}`}>{delta}</span>
        ) : null}
      </div>
      <div className="mt-3">
        <span className={`block font-display text-lg font-bold tracking-tight ${VALUE_TONES[tone]}`}>{value}</span>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-clb-ink">{label}</span>
          {sub ? <span className="text-xs text-clb-muted">{sub}</span> : null}
        </div>
      </div>
    </Tag>
  )
}
