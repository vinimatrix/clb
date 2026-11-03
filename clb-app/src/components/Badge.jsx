const TONES = {
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  orange: 'bg-clb-orangeLight text-[#7a3000] border-clb-orangeLight',
  blue: 'bg-clb-blueLight text-clb-primaryDeep border-clb-blueLight',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  solidOrange: 'bg-clb-orange text-white border-clb-orange',
  solidBlue: 'bg-clb-primary text-white border-clb-primary',
}

export function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
