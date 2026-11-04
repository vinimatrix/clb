import { useMemo, useState } from 'react'
import { ContactActions, FilterPills, SearchBar } from '../../components/index.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const BADGE_ESTADO = {
  blindado: { label: '100%', tone: 'green' },
  proceso: { label: 'En Proceso', tone: 'blue' },
  prioridad: { label: 'Prioridad', tone: 'orange' },
}

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'blindado', label: '100%' },
  { id: 'proceso', label: 'En Proceso' },
  { id: 'prioridad', label: 'Prioridad' },
]

const CAMPOS = [
  { id: 'nombre', label: 'Nombre de la familia', match: /^Nombre de la familia/i },
  { id: 'lider', label: 'Líder' },
  { id: 'cedulaLider', label: 'Cédula' },
  { id: 'sector', label: 'Sector' },
  { id: 'recintoMesa', label: 'Recinto / Mesa' },
]

const inputCls =
  'h-11 w-full rounded-lg bg-slate-50 px-3 text-sm text-clb-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-clb-primary'

/** CBA — Comités de Base Afectivos (ref: stitch-reference/17-cba-afectivos.html). */
export default function Cba() {
  const toast = useToast()
  const { metricas, comites, session } = useAppState()
  const { addComite } = useApp().actions
  const [filtro, setFiltro] = useState('todos')
  const [query, setQuery] = useState('')
  const [hojaAbierta, setHojaAbierta] = useState(false)
  const [form, setForm] = useState({ nombre: '', lider: '', cedulaLider: '', sector: '', recintoMesa: '' })

  const cba = useMemo(() => comites.filter((c) => c.tipo === 'CBA'), [comites])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digitos = q.replace(/\D/g, '')
    let lista = cba
    if (filtro !== 'todos') lista = lista.filter((c) => c.estado === filtro)
    if (!q) return lista
    return lista.filter((c) => {
      const porNombre = String(c.nombre ?? '').toLowerCase().includes(q) || String(c.lider ?? '').toLowerCase().startsWith(q)
      const porCedula = digitos.length >= 3 && String(c.cedulaLider ?? '').replace(/\D/g, '').includes(digitos)
      return porNombre || porCedula
    })
  }, [cba, filtro, query])

  function crear(e) {
    e.preventDefault()
    if (!form.nombre || !form.lider) {
      toast.show('Completa el nombre y el líder')
      return
    }
    const creado = addComite('CBA', {
      nombre: form.nombre,
      lider: form.lider,
      cedulaLider: form.cedulaLider,
      sector: form.sector,
      recinto: form.recintoMesa,
    })
    setHojaAbierta(false)
    setForm({ nombre: '', lider: '', cedulaLider: '', sector: '', recintoMesa: '' })
    toast.show(`CBA ${creado.codigo} creado y en cola`, 'green')
  }

  return (
    <div data-testid="page-cba" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-clb-primary via-clb-primary to-[#003178] p-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 rounded-full bg-clb-orange/20 blur-2xl" />
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            Células Afectivas Activas
          </span>
          <span className="rounded-full bg-clb-orange px-2 py-0.5 text-[10px] font-semibold text-white">{cba.length} CBA</span>
        </div>
        <h2 className="font-display mb-1 text-lg font-extrabold tracking-tight">Comités de Base Afectivos</h2>
        <p className="mb-4 text-[11px] font-medium text-blue-100">Hato Mayor del Rey • Red familiar y vecinal de confianza</p>
        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-md">
          <div className="mb-1.5 flex items-end justify-between">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-100">Fidelización Electoral</span>
              <span className="font-display text-sm font-black text-white">{metricas.cbaResumen.asegurado}% Asegurado</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-300">Meta: 100% Día D</span>
              <span className="block text-[11px] font-semibold text-white/90">{metricas.cbaResumen.electores} Electores</span>
            </div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gradient-to-r from-clb-orange to-amber-400" style={{ width: `${metricas.cbaResumen.asegurado}%` }} />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="KPIs CBA" className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
              <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Voto Seguro</span>
          </div>
          <span className="font-display text-xl font-bold text-clb-primary">{metricas.cbaResumen.votoSeguro}</span>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Por Visitar</span>
          </div>
          <span className="font-display text-xl font-bold text-clb-orange">{metricas.cbaResumen.porVisitar}</span>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setHojaAbierta(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-primary font-display text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Crear Nuevo CBA
      </button>

      <SearchBar placeholder="Buscar por nombre o cédula..." value={query} onChange={setQuery} onClear={() => setQuery('')} />

      <FilterPills
        options={FILTROS.map((f) => ({
          id: f.id,
          label: f.label,
          count: f.id === 'todos' ? cba.length : cba.filter((c) => c.estado === f.id).length,
        }))}
        active={filtro}
        onChange={setFiltro}
      />

      <section className="flex flex-col gap-2.5">
        {filtrados.map((c) => {
          const badge = BADGE_ESTADO[c.estado] ?? BADGE_ESTADO.proceso
          const toneCls = badge.tone === 'green'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : badge.tone === 'orange'
              ? 'border-clb-orangeLight bg-clb-orangeLight text-[#7a3000]'
              : 'border-clb-blueLight bg-clb-blueLight text-clb-primaryDeep'
          return (
            <article key={c.id} data-testid="cba-card" className="rounded-xl bg-white p-3.5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clb-primary font-display text-sm font-bold text-white">CBA</div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold text-clb-primary">{c.nombre}</span>
                    <span className="text-[11px] text-slate-600">{c.lider} • {c.sector}</span>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneCls}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                Código {c.codigo} • {c.recinto}
              </p>
              <p className="text-[11px] font-semibold text-clb-ink">{c.votos}</p>
              {c.alerta ? (
                <p className="mt-1.5 rounded bg-clb-orangeLight/50 px-2 py-1 text-[10px] font-semibold text-[#7a3000]">{c.alerta}</p>
              ) : null}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <ContactActions tel={c.telefono} waText={`Hola ${c.lider}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló.`} />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-accion="ver-integrantes"
                    onClick={() => toast.show(`${c.integrantes} integrantes listados (con backend)`)}
                    className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2.5 text-[10px] font-bold text-clb-primary transition-colors hover:bg-slate-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    Integrantes
                  </button>
                  <button
                    type="button"
                    data-accion="revalidar"
                    onClick={() => toast.show('Simpatizante revalidado', 'green')}
                    className="flex h-9 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-[10px] font-bold text-emerald-800 transition-colors hover:bg-emerald-600 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">autorenew</span>
                    Revalidar
                  </button>
                  <button
                    type="button"
                    data-accion="auditoria"
                    onClick={() => toast.show('Auditoría completada', 'green')}
                    className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold text-slate-500 transition-colors hover:text-clb-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">fact_check</span>
                    Auditoría
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {/* Hoja de creación */}
      {hojaAbierta ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40" onClick={() => setHojaAbierta(false)}>
          <div
            className="mx-auto w-full max-w-[440px] rounded-t-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <h3 className="font-display mb-1 text-base font-bold text-clb-primary">Crear Nuevo CBA</h3>
            <p className="mb-4 text-xs text-slate-600">Se agrega a tu red con estado de proceso.</p>
            <form className="flex flex-col gap-3" onSubmit={crear}>
              {CAMPOS.map((c) => (
                <div key={c.id} className="flex flex-col gap-1">
                  <label htmlFor={`cba-${c.id}`} className="text-xs font-semibold text-clb-primary">
                    {c.label}
                  </label>
                  <input
                    id={`cba-${c.id}`}
                    value={form[c.id]}
                    onChange={(e) => setForm({ ...form, [c.id]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHojaAbierta(false)}
                  className="h-11 flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button type="submit" className="h-11 flex-1 rounded-lg bg-clb-primary text-sm font-bold text-white shadow-md transition-all hover:opacity-95">
                  Crear CBA
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
