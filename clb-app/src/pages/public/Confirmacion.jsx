import { Link, useNavigate } from 'react-router-dom'
import { MarcaCLB, Button } from '../../components/index.js'
import { maskCedulaOculta } from '../../lib/format.js'
import { useAppState } from '../../store/AppContext.jsx'

/** Paso 3 — Confirmación y validación del padrón (ref: stitch-reference/03). */
export default function Confirmacion() {
  const navigate = useNavigate()
  const { registro } = useAppState()

  if (!registro?.cedula) {
    return (
      <main data-testid="page-confirmacion" className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-clb-muted">No hay registro en curso.</p>
        <Link to="/registro" className="mt-3 font-bold text-clb-primary underline">
          Comenzar registro
        </Link>
      </main>
    )
  }

  return (
    <main data-testid="page-confirmacion" className="flex min-h-dvh flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <Link to="/registro" aria-label="Volver" className="flex h-9 w-9 items-center justify-center rounded-full text-clb-navy">
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </Link>
        <MarcaCLB />
        <div className="w-9" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4 text-center">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>Paso 3 de 7: Confirmación</span>
        </div>
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10">
          <span className="material-symbols-outlined text-[56px] font-bold text-emerald-500">check</span>
        </div>
        <h1 className="mb-3 max-w-xs font-display text-xl font-bold leading-snug tracking-tight text-clb-navy sm:text-2xl">
          ¡Gracias por unirse al Proyecto Carmen Ligia Barceló!
        </h1>
        <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-600">
          Hemos validado tu información. Ahora crearemos tu cuenta para que puedas acceder a la plataforma.
        </p>
        <div className="mb-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left shadow-card">
          <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verificación Padrón</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
              <span className="material-symbols-outlined mr-1 text-[14px]">verified</span>
              Cédula Válida
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Cédula:</span>
              <span className="font-semibold text-slate-800">{maskCedulaOculta(registro.cedula)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estatus:</span>
              <span className="font-semibold text-emerald-600">Identidad confirmada</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex w-full flex-col items-center px-6 pb-6 pt-2">
        <Button
          variant="orange"
          size="lg"
          onClick={() => {
            navigate('/registro/usuario')
          }}
        >
          Continuar
        </Button>
        <p className="mt-4 text-[11px] font-medium italic text-slate-400">"Gente organizada, un mejor futuro."</p>
      </footer>
    </main>
  )
}
