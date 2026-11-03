import { useNavigate } from 'react-router-dom'

/** Silueta de retrato como placeholder local (sin dependencia de enlaces externos). */
function RetratoPlaceholder() {
  return (
    <div className="flex h-full w-full items-end justify-center">
      <svg viewBox="0 0 200 260" className="h-[82%] drop-shadow-xl" aria-hidden="true">
        <ellipse cx="100" cy="70" rx="42" ry="48" fill="rgba(255,255,255,0.85)" />
        <path d="M30 260 C30 190 60 150 100 150 C140 150 170 190 170 260 Z" fill="rgba(255,255,255,0.85)" />
        <rect x="76" y="96" width="48" height="10" rx="5" fill="rgba(13,71,161,0.25)" />
      </svg>
    </div>
  )
}

/** Portada de campaña (ref: stitch-reference/01-portada.html). */
export default function Portada() {
  const navigate = useNavigate()
  return (
    <main
      data-testid="portada"
      className="relative mx-auto flex min-h-dvh max-w-[440px] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0a2f73] via-[#1051b8] to-[#0d3f94]"
    >
      {/* Resplandor tras el retrato */}
      <div className="pointer-events-none absolute bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />

      {/* Marca */}
      <header className="relative z-20 flex items-center justify-between px-6 pb-1 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-[#0e3b85] p-1.5 shadow-md">
            <svg viewBox="0 0 24 24" className="h-full w-full fill-white" aria-hidden="true">
              <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.22 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-4.43z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-white">Carmen Ligia</span>
            <span className="font-display text-base font-black uppercase leading-none tracking-wider text-white">Barceló</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1 pr-1">
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-transparent to-[#009fe3]" />
          <div className="h-1 w-7 rounded-full bg-clb-orange" />
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col px-6">
        <section className="pt-2">
          <span className="rounded bg-white/10 px-2 py-0.5 text-[12px] font-black uppercase tracking-wider text-clb-orange backdrop-blur-sm">
            Hato Mayor
          </span>
          <h1 className="mt-2 max-w-[270px] font-display text-[28px] font-black uppercase leading-[1.05] tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
            ¡Trabajemos Juntos <span className="align-middle text-xs font-bold normal-case">por un</span> Mejor
            Futuro Para Todos!
          </h1>
        </section>

        <div className="pointer-events-none absolute inset-x-0 bottom-24 top-24 z-0">
          <RetratoPlaceholder />
        </div>

        <div className="relative z-20 mt-auto pb-3">
          <p className="pl-1 text-base font-medium italic tracking-wide text-white/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            Gente organizada, <span className="font-normal text-white/90">un mejor futuro.</span>
          </p>
        </div>

        <div className="relative z-30 flex flex-col gap-2.5 pb-4">
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="w-full rounded-full border-t border-orange-300/40 bg-clb-orange py-3.5 px-6 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-clb-orangeDeep active:scale-[0.98]"
          >
            ¡Unirme al proyecto!
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-clb-orange py-3.5 px-6 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-clb-orangeDeep active:scale-[0.98]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white" aria-hidden="true">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Pie institucional */}
      <footer className="relative z-20 flex flex-col items-center px-4 pb-6 text-center">
        <div className="mb-1 flex items-center gap-1">
          <div className="h-0.5 w-3.5 rounded-full bg-[#002f6c]" />
          <div className="h-0.5 w-3 rounded-full bg-white" />
          <div className="h-0.5 w-3.5 rounded-full bg-[#ce1126]" />
        </div>
        <p className="text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-white/80">República Dominicana</p>
        <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.18em] text-white/60">Trabajo • Organización • Resultados</p>
      </footer>
    </main>
  )
}
