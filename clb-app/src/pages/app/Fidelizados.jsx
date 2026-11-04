import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, ContactActions, FilterPills } from '../../components/index.js'
import { maskCedula, iniciales, formatNumber } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const BADGE_ESTADO = {
  fidelizado: { label: 'Voto Seguro', tone: 'green' },
  simpatizante: { label: 'Simpatizante', tone: 'orange' },
}

const SEGMENTOS = [
  { id: 'todos', label: 'Todos' },
  { id: 'fidelizado', label: 'Voto Seguro' },
  { id: 'simpatizante', label: 'Simpatizantes' },
]

/** Fidelizados de la circunscripción (ref: stitch-reference/16-fidelizados.html). */
export default function Fidelizados() {
  const navigate = useNavigate()
  const toast = useToast()
  const { metricas, electores, session } = useAppState()
  const { reconfirmarFidelizado } = useApp().actions
  const [segmento, setSegmento] = useState('todos')
  const [query, setQuery] = useState('')

  const pctMeta = ((metricas.fidelizadosCirc / metricas.metaFidelizadosCirc) * 100).toFixed(1)

  const base = useMemo(
    () => electores.filter((e) => e.estado === 'fidelizado' || e.estado === 'simpatizante'),
    [electores],
  )

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digitos = q.replace(/\D/g, '')
    let lista = base
    if (segmento !== 'todos') lista = lista.filter((e) => e.estado === segmento)
    if (!q) return lista
    return lista.filter((e) => {
      const nombreCompleto = `${e.nombres} ${e.apellidos}`.trim().toLowerCase()
      const porNombre = nombreCompleto.startsWith(q)
      const porCedula = digitos.length >= 3 && String(e.cedula ?? '').replace(/\D/g, '').includes(digitos)
      return porNombre || porCedula
    })
  }, [base, segmento, query])

  return (
    <div data-testid="page-fidelizados" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Banner de estrategia */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-clb-primary to-[#1051b8] p-4 text-white shadow-md">
        <div className="pointer-events-none absolute -bottom-6 -right-4 h-24 w-24 rounded-full bg-clb-orange/25" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <span className="material-symbols-outlined text-[24px]">flag</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <span className="h-1 w-2 rounded-full bg-white" />
              <span className="h-1 w-2 rounded-full bg-clb-red" />
              Estrategia Electoral CLB
            </span>
            <p className="font-display truncate text-sm font-bold">Red de Fidelizados CLB</p>
            <p className="truncate text-[11px] text-blue-100">Hato Mayor del Rey • Circunscripción 01</p>
          </div>
        </div>
        <div className="relative z-10 mt-2.5 flex flex-col items-end">
          <span className="rounded-full bg-clb-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Activo</span>
          <span className="mt-1 text-[10px] text-blue-100">Día D: -18 días</span>
          <span className="text-[10px] text-blue-100">2026-11-24</span>
        </div>
      </section>

      {/* Métrica principal */}
      <section className="rounded-xl bg-white p-4 shadow-card">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Fidelizados</span>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-clb-primary">Meta {formatNumber(metricas.metaFidelizadosCirc)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl font-bold text-clb-primary">{formatNumber(metricas.fidelizadosCirc)}</span>
          <span className="text-sm font-bold text-clb-orange">{pctMeta}% alcanzado</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-clb-orange transition-all duration-500" style={{ width: `${pctMeta}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg bg-slate-50 p-2.5">
            <span className="block text-[10px] font-bold uppercase text-slate-600">Voto Seguro</span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold text-emerald-700">{formatNumber(metricas.votoSeguroCirc)}</span>
              <span className="text-[10px] text-slate-500">electores</span>
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5">
            <span className="block text-[10px] font-bold uppercase text-slate-600">Por Revalidar</span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-lg font-bold text-clb-orange">{formatNumber(metricas.porRevalidarCirc)}</span>
              <span className="text-[10px] text-slate-500">electores</span>
            </span>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => navigate('/app/inscripcion')}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-orange font-display text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[18px]">person_add</span>
        Registrar Fidelizado
      </button>

      <FilterPills
        options={SEGMENTOS.map((s) => ({
          id: s.id,
          label: s.label,
          count: s.id === 'todos' ? base.length : base.filter((e) => e.estado === s.id).length,
        }))}
        active={segmento}
        onChange={setSegmento}
      />

      {filtrados.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-600 shadow-card">Sin resultados en este segmento.</p>
      ) : (
        filtrados.map((e) => {
          const badge = BADGE_ESTADO[e.estado] ?? BADGE_ESTADO.simpatizante
          return (
            <article key={e.id} data-testid="fid-card" className="rounded-xl bg-white p-3.5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar text={iniciales(e.nombres, e.apellidos)} size={38} tone={e.estado === 'fidelizado' ? 'blue' : 'light'} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold text-clb-ink">
                      {e.nombres} {e.apellidos}
                    </span>
                    <span className="text-[11px] text-slate-600">{maskCedula(e.cedula)} • Mesa {e.mesa}</span>
                </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.tone === 'green' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-clb-orangeLight bg-clb-orangeLight text-[#7a3000]'}`}>
                  {badge.label}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                {e.reconfirmadoAt ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700" data-estado="reconfirmado">
                    <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
                    Reconfirmado
                  </span>
                ) : (
                  <button
                    type="button"
                    data-accion="reconfirmar"
                    onClick={() => {
                      reconfirmarFidelizado(e.id)
                      toast.show('Voto reconfirmado en firme', 'green')
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-clb-primary transition-colors hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    Reconfirmar Voto
                  </button>
                )}
                <ContactActions tel={e.telefono} waText={`Hola ${e.nombres}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló. Confirmamos tu voto seguro el 24/11.`} />
              </div>
            </article>
          )
        })
      )}
    </div>
  )
}

