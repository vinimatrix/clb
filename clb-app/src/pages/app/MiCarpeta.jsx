import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchBar, FilterPills, ProgressBar, ContactActions, Avatar, Badge } from '../../components/index.js'
import { maskCedula, iniciales } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString()

const BADGE_ESTADO = {
  fidelizado: { label: 'Voto Seguro', tone: 'green' },
  simpatizante: { label: 'Simpatizante', tone: 'orange' },
  indeciso: { label: 'Indeciso', tone: 'gray' },
}

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'llamada', label: 'Por Llamar' },
  { id: 'visita', label: 'Visita Pendiente' },
  { id: 'fidelizado', label: 'Voto Seguro' },
  { id: 'indeciso', label: 'Indecisos' },
]

/**
 * Mi Carpeta del dirigente (ref: stitch-reference/15-mi-carpeta.html).
 * Electores asignados + tareas pendientes con filtros y búsqueda.
 */
export default function MiCarpeta() {
  const navigate = useNavigate()
  const toast = useToast()
  const { session, electores, tareas } = useAppState()
  const { completarTarea } = useApp().actions
  const [query, setQuery] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const asignados = useMemo(
    () => electores.filter((e) => e.asignadoA && (e.asignadoA === session?.username || e.asignadoA === 'demo')),
    [electores, session],
  )
  const fidelizados = asignados.filter((e) => e.estado === 'fidelizado')
  const pendientes = useMemo(
    () => tareas.filter((t) => t.estado === 'pendiente'),
    [tareas],
  )
  const tareasLlamada = pendientes.filter((t) => t.tipo === 'llamada')
  const tareasVisita = pendientes.filter((t) => t.tipo === 'visita')

  // Elector -> tarea pendiente (para Completar)
  const tareaPorElector = useMemo(() => {
    const mapa = new Map()
    for (const t of pendientes) mapa.set(t.electorId, t)
    return mapa
  }, [pendientes])

  const conteos = useMemo(() => ({
    todos: asignados.length,
    llamada: tareasLlamada.length,
    visita: tareasVisita.length,
    fidelizado: fidelizados.length,
    indeciso: asignados.filter((e) => e.estado === 'indeciso').length,
  }), [asignados, tareasLlamada, tareasVisita, fidelizados])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digitos = q.replace(/\D/g, '')
    let base = asignados
    if (filtro === 'llamada') base = base.filter((e) => tareaPorElector.get(e.id)?.tipo === 'llamada')
    else if (filtro === 'visita') base = base.filter((e) => tareaPorElector.get(e.id)?.tipo === 'visita')
    else if (filtro !== 'todos') base = base.filter((e) => e.estado === filtro)
    if (!q) return base
    return base.filter((e) => {
      const nombreCompleto = `${e.nombres} ${e.apellidos}`.trim().toLowerCase()
      const porNombre = nombreCompleto.startsWith(q)
      const porCedula = digitos.length >= 3 && String(e.cedula ?? '').replace(/\D/g, '').includes(digitos)
      return porNombre || porCedula
    })
  }, [asignados, query, filtro, tareaPorElector])

  const pctMeta = Math.round((fidelizados.length / Math.max(1, asignados.length)) * 100)
  const pctExito = ((fidelizados.length / Math.max(1, asignados.length)) * 100).toFixed(1)

  return (
    <div data-testid="page-carpeta" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Encabezado */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-3.5 rounded-full bg-clb-primary" />
          <div className="h-1.5 w-3.5 rounded-full bg-clb-red" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Territorio Digital</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Sincronizado
        </span>
      </section>

      {/* Hero dirigente */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#003178] via-clb-primary to-[#1660c8] p-4 text-white shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-clb-orange/25 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative">
              <Avatar text={iniciales(session?.nombres, session?.apellidos)} size={48} tone="blue" className="ring-2 ring-white/30" />
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clb-orange">
                <span className="material-symbols-outlined text-[10px] text-white">star</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display truncate text-base font-bold tracking-tight">
                  {session?.nombres} {session?.apellidos}
                </h2>
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  {session?.role || 'Dirigente'}
                </span>
              </div>
              <p className="truncate text-[11px] text-blue-100">Circunscripción 01 • Hato Mayor del Rey</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Código QR de mi carpeta"
            onClick={() => toast.show('QR disponible en la versión con backend')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
          </button>
        </div>
        <div className="relative z-10 mt-3 flex flex-col gap-1 border-t border-white/10 pt-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-blue-100">Meta de Fidelización Territorial</span>
            <span className="font-bold">
              {fidelizados.length} / {asignados.length} electores ({pctMeta}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-clb-orange transition-all duration-500" style={{ width: `${pctMeta}%` }} />
          </div>
        </div>
      </section>

      {/* Métricas */}
      <section aria-label="Métricas de la carpeta" className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
            <span className="material-symbols-outlined text-[18px]">group</span>
          </div>
          <span className="font-display text-base font-bold text-clb-primary">{asignados.length}</span>
          <span className="text-[10px] font-medium text-slate-600">Contactos</span>
          <span className="text-[8px] font-bold uppercase text-clb-primary">Asignados</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <span className="font-display text-base font-bold text-emerald-800">{fidelizados.length}</span>
          <span className="text-[10px] font-medium text-slate-600">Voto Seguro</span>
          <span className="text-[8px] font-bold uppercase text-emerald-700">{pctExito}% Éxito</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
            <span className="material-symbols-outlined text-[18px]">assignment_late</span>
          </div>
          <span className="font-display text-base font-bold text-clb-orange">{pendientes.length}</span>
          <span className="text-[10px] font-medium text-slate-600">Pendientes</span>
          <span className="text-[8px] font-bold uppercase text-clb-orange">{tareasLlamada.length} Llam • {tareasVisita.length} Vis</span>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/app/inscripcion')}
          className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-clb-primary text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Agregar Elector
        </button>
        <button
          type="button"
          onClick={() => {
            setFiltro('llamada')
            setQuery('')
          }}
          className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-white text-sm font-bold text-clb-primary shadow-sm ring-1 ring-clb-primary/30 transition-all hover:bg-clb-blueLight active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          Llamadas Hoy
        </button>
      </section>

      <SearchBar placeholder="Buscar por nombre o cédula..." value={query} onChange={setQuery} onClear={() => setQuery('')} />

      <FilterPills
        options={FILTROS.map((f) => ({ id: f.id, label: f.label, count: conteos[f.id] ?? 0 }))}
        active={filtro}
        onChange={setFiltro}
      />

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined text-[24px]">folder_off</span>
          </div>
          <p className="text-sm font-bold text-clb-ink">Nada pendiente aquí</p>
          <p className="text-xs text-slate-600">Ajusta el filtro o la búsqueda de tu carpeta.</p>
        </div>
      ) : (
        <section className="flex flex-col gap-2.5">
          {filtrados.map((e) => {
            const badge = BADGE_ESTADO[e.estado] ?? { label: e.estado, tone: 'gray' }
            const tarea = tareaPorElector.get(e.id)
            return (
              <article key={e.id} data-testid="carpeta-card" className="rounded-xl bg-white p-3.5 shadow-card">
                <div className="flex items-start gap-3">
                  <Avatar text={iniciales(e.nombres, e.apellidos)} size={40} tone={e.estado === 'fidelizado' ? 'blue' : 'light'} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-clb-ink">{e.nombres}</span>
                        <span className="truncate text-sm text-clb-ink">{e.apellidos}</span>
                      </div>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {maskCedula(e.cedula)} • Mesa {e.mesa} • {e.sector}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  {tarea ? (
                    <button
                      type="button"
                      data-accion="completar"
                      onClick={() => {
                        completarTarea(tarea.id)
                        toast.show('Tarea completada', 'green')
                      }}
                      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold transition-colors ${
                        tarea.tipo === 'visita' ? 'bg-clb-orange text-white hover:bg-orange-500' : 'bg-slate-100 text-clb-muted hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tarea.tipo === 'visita' ? 'directions_walk' : 'call'}</span>
                      {tarea.tipo === 'visita' ? 'Visita pendiente' : 'Llamar hoy'}
                    </button>
                  ) : (
                    <span
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[11px] font-bold text-white"
                      data-estado="lista"
                    >
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      ¡Lista!
                    </span>
                  )}
                  <ContactActions tel={e.telefono} waText={`Hola ${e.nombres}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló.`} />
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* Widget inferior */}
      <section className="flex items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-card">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
            <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-bold text-clb-ink">{tareasLlamada.length} llamadas restantes</span>
            <span className="text-[11px] text-slate-600">Meta de hoy: {DEFAULT_META} llamadas</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast.show('Difusión disponible en la versión con backend')}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-clb-primary px-3 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-clb-primaryDeep"
        >
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          Difusión
        </button>
      </section>
    </div>
  )
}

const DEFAULT_META = 10
