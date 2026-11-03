const VARIANTS = {
  orange: 'bg-clb-orange hover:bg-clb-orangeDeep text-white shadow-md shadow-orange-500/20',
  blue: 'bg-clb-primary hover:bg-clb-primaryDeep text-white shadow-md',
  green: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md',
  outline: 'bg-white text-clb-primary border-[1.5px] border-clb-primary hover:bg-blue-50',
  ghost: 'bg-transparent text-clb-primary hover:bg-clb-blueLight/40',
  surface: 'bg-white text-clb-primary hover:bg-slate-50 shadow-sm',
}

const SIZES = {
  md: 'h-12 text-sm',
  lg: 'h-[52px] text-base',
  sm: 'h-10 text-xs',
}

export function Button({ variant = 'orange', size = 'md', full = true, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-6 font-bold uppercase tracking-wide transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
