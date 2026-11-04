import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MetricCard, ProgressBar, FilterPills, Badge } from '../../components/index.js'
import { formatNumber } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const TABS = [
  { id: 'mesas', label: 'Mesas' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'incidencias', label: 'Incidencias' },
]

const BADGE_ESTADO = {
  completa: { label: 'Completa', tone: 'green' },
  'falta-suplente': { label: 'Falta suplente', tone: 'orange' },
}

/** Mi Recinto (ref: stitch-reference/12-mi-recinto.html). */
export default function MiRecinto() {
  const navigate = useNavigate()
  const toast = useToast()
  const { recinto, incidencias } = useAppState()
  const { reportarIncidencia } = useApp().actions
  const [tab, setTab] = useState('mesas')
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const [colegioNov, setColegioNov] = useState('0012A')
  const [textoNov, setTextoNov] = useState('')

  if (!recinto) return null

  const asegurar1Decimal = (n) => (Math.floor(n * 10) / 10).toFixed(1)
  const pctAsegurado = asegurar1Decimal((recinto.fidelizados / recinto.padronTotal) * 100)
  const barraParticipacion = asegurar1Decimal((recinto.fidelizados / recinto.meta) * 100)

  function enviarReporte(e) {
    e.preventDefault()
    if (!textoNov.trim()) return
    reportarIncidencia({ colegio: colegioNov, texto: textoNov.trim() })
    setTextoNov('')
    setHojaAbierta(false)
    toast.show('Novedad enviada al coordinador', 'green')
  }

  return (
    <div data-testid="page-recinto" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Título de página */}
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={() => navigate('/app')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-clb-orange">
            <span className="h-1.5 w-1.5 rounded-full bg-clb-orange" />
            {recinto.codigo} • Activo
          </span>
          <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">Mi Recinto</h1>
        </div>
      </section>

      {/* Hero del recinto */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-clb-primary to-[#1051b8] p-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-clb-orange/25 blur-xl" />
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display truncate text-base font-bold leading-tight">{recinto.nombre}</h2>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-blue-100">{recinto.direccion}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <span className="material-symbols-outlined text-[22px]">apartment</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Coordinador</span>
              <span className="text-xs font-bold">{recinto.coordinador}</span>
            </div>
          </div>
          <a
            href={`tel:${recinto.coordinadorTel}`}
            aria-label="Llamar al coordinador"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-clb-orange text-white shadow-md transition-colors hover:bg-orange-500"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>
      </section>

      {/* Barra de participación hacia la meta */}
      <section className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-clb-primary">Participación vs Meta</span>
          <span className="text-xs font-bold text-clb-orange">{barraParticipacion}%</span>
        </div>
        <ProgressBar value={Number(barraParticipacion)} tone="blue" height="h-2.5" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-600">Meta del recinto</span>
          <span className="text-[10px] font-bold text-clb-primary">{formatNumber(recinto.meta)}</span>
        </div>
      </section>

      {/* KPIs del recinto */}
      <section aria-label="KPIs del recinto" className="grid grid-cols-2 gap-2.5">
        <MetricCard
          icon={<span className="material-symbols-outlined text-[18px]">grid_view</span>}
          tone="blue"
          value={String(recinto.colegios.length)}
          label="Colegios"
          sub="0012A – 0012F"
        />
        <MetricCard
          icon={<span className="material-symbols-outlined text-[18px]">groups</span>}
          tone="navy"
          value={formatNumber(recinto.padronTotal)}
          label="Padrón"
          sub="Electores habilitados"
        />
        <MetricCard
          icon={<span className="material-symbols-outlined text-[18px]">verified</span>}
          tone="orange"
          value={formatNumber(recinto.fidelizados)}
          label="Fidelizados"
          sub={`${pctAsegurado}% asegurado`}
        />
        <MetricCard
          icon={<span className="material-symbols-outlined text-[18px]">shield_person</span>}
          tone="green"
          value="100%"
          label="Delegados"
          sub={recinto.delegados}
        />
      </section>

      {/* Tabs */}
      <FilterPills options={TABS.map((t) => ({ ...t, count: t.id === 'incidencias' && incidencias.length ? incidencias.length : null }))} active={tab} onChange={setTab} />

      {tab === 'mesas' ? (
        <section className="flex flex-col gap-2.5">
          {recinto.colegios.map((col) => {
            const pct = ((col.fidelizados / col.electores) * 100).toFixed(1)
            const badge = BADGE_ESTADO[col.estado] ?? { label: col.estado, tone: 'gray' }
            return (
              <article key={col.codigo} className="rounded-xl bg-white p-3.5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clb-blueLight font-display text-sm font-bold text-clb-primary">
                      {col.letra}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-bold text-clb-primary">Colegio {col.codigo}</span>
                      <span className="text-[11px] text-slate-600">Mesa {col.codigo}</span>
                    </div>
                  </div>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                  <span className="text-[11px] font-medium text-slate-600">
                    {formatNumber(col.fidelizados)} fid. / {formatNumber(col.electores)} electores
                  </span>
                  <span className="text-[11px] font-bold text-clb-primary">{pct}% padrón</span>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}

      {tab === 'equipo' ? (
        <section className="flex flex-col gap-2.5">
          {recinto.colegios.map((col) => {
            const badge = BADGE_ESTADO[col.estado] ?? { label: col.estado, tone: 'gray' }
            return (
              <article key={col.codigo} className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-card">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clb-blueLight font-display text-sm font-bold text-clb-primary">
                  {inicialesDe(col.delegado)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold text-clb-ink">{col.delegado}</span>
                  <span className="text-[11px] text-slate-600">Delegado titular • Mesa {col.codigo}</span>
                </div>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </article>
            )
          })}
        </section>
      ) : null}

      {tab === 'incidencias' ? (
        <section className="flex flex-col gap-2.5">
          {incidencias.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 text-center shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[24px]">report</span>
              </div>
              <p className="text-sm font-bold text-clb-ink">Sin novedades registradas</p>
              <p className="text-xs text-slate-600">Reporta cualquier anomalía de mesa para que la revise el coordinador.</p>
            </div>
          ) : (
            incidencias.map((inc) => (
              <article key={inc.id} className="rounded-xl bg-white p-3.5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-clb-orangeLight px-2 py-0.5 text-[10px] font-bold text-[#7a3000]">Mesa {inc.colegio}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(inc.fecha).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-clb-ink">{inc.texto}</p>
              </article>
            ))
          )}
        </section>
      ) : null}

      {/* CTAs */}
      <section className="flex flex-col gap-2 pb-2 pt-1">
        <button
          type="button"
          onClick={() => navigate('/app/padron')}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-primary font-display text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
        >
          <span>Ver Padrón de Recinto ({formatNumber(recinto.padronTotal)})</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <button
          type="button"
          onClick={() => setHojaAbierta(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white font-display text-sm font-bold text-clb-orange shadow-sm ring-1 ring-clb-orange/40 transition-all hover:bg-clb-orangeLight/40 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[18px]">report</span>
          <span>Reportar Novedad de Mesa</span>
        </button>
      </section>

      {/* Hoja de reporte */}
      {hojaAbierta ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40" onClick={() => setHojaAbierta(false)}>
          <div
            className="mx-auto w-full max-w-[440px] rounded-t-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <h3 className="font-display mb-1 text-base font-bold text-clb-primary">Reportar Novedad de Mesa</h3>
            <p className="mb-4 text-xs text-slate-600">La novedad se envía a la cola del coordinador del recinto.</p>
            <form className="flex flex-col gap-3" onSubmit={enviarReporte}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="colegioNovedad" className="text-xs font-semibold text-clb-primary">
                  Colegio
                </label>
                <select
                  id="colegioNovedad"
                  value={colegioNov}
                  onChange={(e) => setColegioNov(e.target.value)}
                  className="h-11 w-full rounded-lg bg-slate-50 px-3 text-sm text-clb-ink outline-none focus:ring-2 focus:ring-clb-primary"
                >
                  {recinto.colegios.map((col) => (
                    <option key={col.codigo} value={col.codigo}>
                      Mesa {col.codigo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="textoNovedad" className="text-xs font-semibold text-clb-primary">
                  Novedad
                </label>
                <textarea
                  id="textoNovedad"
                  rows={3}
                  value={textoNov}
                  onChange={(e) => setTextoNov(e.target.value)}
                  placeholder="Describe qué pasó en la mesa..."
                  className="w-full rounded-lg bg-slate-50 p-3 text-sm text-clb-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-clb-primary"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHojaAbierta(false)}
                  className="h-11 flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 rounded-lg bg-clb-orange text-sm font-bold text-white shadow-md transition-all hover:opacity-95"
                >
                  Enviar reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function inicialesDe(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
