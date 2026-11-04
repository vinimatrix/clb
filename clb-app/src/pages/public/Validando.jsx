import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../store/AppContext.jsx'

const PASOS = [
  { icono: 'badge', texto: 'Verificando usuario' },
  { icono: 'lock', texto: 'Validando contraseña' },
  { icono: 'how_to_reg', texto: 'Identificando rol' },
  { icono: 'shield', texto: 'Cargando permisos' },
]
const PROGRESOS = ['45%', '70%', '88%', '100%']
const INTERVALO = 900

/** Paso 9 — Validando credenciales con checklist animado (ref: 09-paso9-validacion.html). */
export default function Validando() {
  const navigate = useNavigate()
  const session = useAppState((s) => s.session)
  const [paso, setPaso] = useState(0) // índice del paso actual (0..4; 4 = completado)

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
      return undefined
    }
    const id = setInterval(() => {
      setPaso((p) => {
        if (p >= PASOS.length) return p
        return p + 1
      })
    }, INTERVALO)
    return () => clearInterval(id)
  }, [session, navigate])

  useEffect(() => {
    if (paso >= PASOS.length) {
      const t = setTimeout(() => navigate('/app', { replace: true }), 400)
      return () => clearTimeout(t)
    }
    return undefined
  }, [paso, navigate])

  const progreso = PROGRESOS[Math.max(0, paso - 1)] ?? '10%'

  return (
    <main data-testid="page-validando" className="flex min-h-dvh flex-col bg-clb-surface">
      <header className="fixed inset-x-0 top-0 z-50 bg-clb-surface/80 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[440px] items-center justify-between px-4">
          <button type="button" aria-label="Volver" onClick={() => navigate('/login')} className="flex h-11 w-11 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-200/40">
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clb-primary shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-white">thumb_up</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[13px] font-extrabold leading-tight tracking-tight text-clb-primary">CARMEN LIGIA</span>
              <span className="text-[10px] font-bold leading-none tracking-widest text-clb-orange">BARCELÓ</span>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clb-primary">
            <span className="material-symbols-outlined text-[18px] text-white">person</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-4 pb-8 pt-16">
        <div className="my-3 flex items-center justify-center gap-1.5">
          <div className="h-1 w-8 rounded-full bg-clb-primary" />
          <div className="h-1 w-2.5 rounded-full bg-slate-300" />
          <div className="h-1 w-8 rounded-full bg-clb-red" />
        </div>

        <div className="relative flex w-full flex-col items-center overflow-hidden rounded-xl bg-white p-6 shadow-lg">
          {/* Resplandores ambientales */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-clb-orange/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-clb-primary/10 blur-2xl" />

          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-clb-blueLight px-3 py-1 text-clb-primaryDeep">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clb-primary" />
            <span className="text-[11px] uppercase tracking-wider">Paso 9 • Seguridad Territorial</span>
          </div>

          {/* Escudo */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 scale-125 animate-ping rounded-full bg-clb-primary/10 opacity-75" />
            <div className="absolute -inset-2 rounded-full bg-clb-primary/40 blur-md" />
            <div className="relative flex h-28 w-24 items-center justify-center overflow-hidden rounded-t-xl rounded-b-[42px] bg-gradient-to-b from-[#003178] via-[#0d47a1] to-[#1c3363] shadow-xl">
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-white/15" />
              <div className="absolute bottom-0 right-0 h-12 w-12 rounded-full bg-clb-orange/20 blur-sm" />
              <span className="material-symbols-outlined select-none text-[52px] text-white" style={{ fontVariationSettings: "'wght' 700" }}>
                check
              </span>
            </div>
          </div>

          <h2 className="font-display mb-1 text-center text-xl font-bold text-clb-primary">Validando credenciales</h2>
          <p className="mb-6 text-center text-xs text-slate-600">Verificando identidad institucional y asignación de recinto...</p>

          {/* Barra de progreso */}
          <div className="relative mb-8 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 shadow-inner">
            <div
              data-testid="progress-bar"
              className="h-full rounded-full bg-gradient-to-r from-clb-primary via-clb-primary to-clb-orange transition-all duration-700 ease-out"
              style={{ width: paso === 0 ? '10%' : progreso }}
            />
          </div>

          {/* Checklist */}
          <div className="w-full max-w-xs space-y-3.5">
            {PASOS.map((p, i) => {
              const hecho = paso > i
              const activo = paso === i
              return (
                <div
                  key={p.icono}
                  data-testid={`paso-${i + 1}`}
                  className={`flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-all duration-300 ${activo ? 'scale-[1.02] ring-1 ring-clb-primary/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${
                        hecho || activo ? 'bg-white text-clb-primary' : 'bg-white text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{p.icono}</span>
                    </div>
                    <span className="text-sm text-slate-900">{p.texto}</span>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm ${
                      hecho ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <span className="material-symbols-outlined text-[18px] text-clb-orange">encrypted</span>
            <span className="text-[11px] font-medium text-slate-600">Conexión cifrada de extremo a extremo • JCE Sync</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-2 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-clb-primary">dns</span>
            <span className="text-xs">Nodo: Santo Domingo Central</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-clb-orange">CLB Móvil v2.4</span>
        </div>
      </div>

      <footer className="mt-auto flex w-full flex-col items-center justify-center gap-2 bg-clb-surface/90 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-4 rounded-full bg-clb-primary" />
          <div className="h-1 w-4 rounded-full bg-clb-red" />
        </div>
        <p className="text-center text-[11px] uppercase tracking-wider text-slate-600">TRABAJO • ORGANIZACIÓN • RESULTADOS</p>
      </footer>
    </main>
  )
}
