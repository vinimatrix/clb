/**
 * Dona SVG estilo mock: r=48, stroke-width=12, circunferencia ≈ 301.59.
 * 14.35% → arco 43.3.
 */
const CIRC = 2 * Math.PI * 48

export function DonutChart({ percent, size = 160, centerValue, centerLabel }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  const arc = (CIRC * p) / 100
  const fixedArc = arc.toFixed(1)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="48" fill="transparent" className="stroke-slate-200" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="transparent"
          className="stroke-clb-orange"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fixedArc} ${(CIRC - arc).toFixed(1)}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-lg font-bold leading-none text-clb-primary">
          {centerValue ?? `${p.toFixed(2)}%`}
        </span>
        {centerLabel ? (
          <span className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-clb-orange">{centerLabel}</span>
        ) : null}
      </div>
    </div>
  )
}
