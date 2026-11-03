import { Link } from 'react-router-dom'

/** Sello de marca CLB: círculo azul con pulgar arriba + tipografía. */
export function MarcaCLB({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-clb-orange bg-clb-primary text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66a1.002 1.002 0 0 0-.84-.59L14 3.05a1 1 0 0 0-.71.29L8.41 8.21C8.14 8.47 8 8.83 8 9.21V19c0 1.1.9 2 2 2h9c.8 0 1.5-.47 1.83-1.17l2.83-6.6a1.01 1.01 0 0 0 .17-.35z" />
        </svg>
      </div>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-clb-muted">Carmen Ligia</span>
        <span className="font-display text-[15px] font-black uppercase tracking-tight text-clb-primary">Barceló</span>
      </div>
    </div>
  )
}

/** Header fijo: botón back opcional, marca, título y acciones a la derecha. */
export function AppHeader({ title, subtitle, onBack, right, to }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-clb-surface/90 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[440px] items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {onBack || to ? (
            <Link
              to={to || '#'}
              onClick={onBack}
              aria-label="Volver"
              className="flex h-11 w-11 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
          ) : null}
          {title ? (
            <div className="min-w-0 flex flex-col">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-clb-primary">{title}</h1>
              {subtitle ? <span className="truncate text-[10px] font-bold uppercase tracking-wider text-clb-muted">{subtitle}</span> : null}
            </div>
          ) : (
            <MarcaCLB />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">{right}</div>
      </div>
    </header>
  )
}
