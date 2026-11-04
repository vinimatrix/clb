import { useMemo, useState } from 'react'
import { ContactActions, FilterPills } from '../../components/index.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const BADGE_ESTADO = {
  blindado: { label: 'Blindado', tone: 'green' },
  'falta-suplente': { label: 'Falta Suplente', tone: 'orange' },
  'por-validar': { label: 'Por Validar', tone: 'gray' },
  proceso: { label: 'En Proceso', tone: 'gray' },
}

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'blindado', label: 'Blindados' },
  { id: 'falta-suplente', label: 'Falta Suplente' },
  { id: 'por-validar', label: 'Por Validar' },
]

const CAMPOS = [
  { id: 'nombre', label: 'Nombre del comité' },
  { id: 'lider', label: 'Presidente' },
  { id: 'cedulaLider', label: 'Cédula' },
  { id: 'recinto', label: 'Recinto' },
  { id: 'mesa', label: 'Mesa' },
]

const inputCls =
  'h-11 w-full rounded-lg bg-slate-50 px-3 text-sm text-clb-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-clb-primary'

/** CBE — Comités de Base Electorales (ref: stitch-reference/18-cbe-electorales.html). */
export default function Cbe() {
  const toast = useToast()
  const { metricas, comites, session } = useAppState()
  const { addComite, asignarSuplente } = useApp().actions
  const [filtro, setFiltro] = useState('todos')
  const [hojaCrear, setHojaCrear] = useState(false)
  const [hojaSuplente, setHojaSuplente] = useState(null) // id del comité
  const [form, setForm] = useState({ nombre: '', lider: '', cedulaLider: '', recinto: '', mesa: '' })
  const [nombreSuplente, setNombreSuplente] = useState('')

  const cbe = useMemo(() => comites.filter((c) => c.tipo === 'CBE'), [comites])
  const mesas = metricas.cbeResumen.mesasCubiertas.split('/').map((n) => parseInt(n, 10))
  const pctCobertura = Math.round((mesas[0] / mesas[1]) * 100)

  const filtrados = useMemo(() => {
    if (filtro === 'todos') return cbe
    return cbe.filter((c) => c.estado === filtro)
  }, [cbe, filtro])

  function crear(e) {
    e.preventDefault()
    if (!form.nombre || !form.lider) {
      toast.show('Completa el nombre y el presidente')
      return
    }
    const creado = addComite('CBE', { ...form, mesa: form.mesa })
    setHojaCrear(false)
    setForm({ nombre: '', lider: '', cedulaLider: '', recinto: '', mesa: '' })
    toast.show(`CBE ${creado.codigo} creado y por validar`, 'green')
  }

  function guardarSuplente(e) {
    e.preventDefault()
    if (!nombreSuplente.trim()) return
    asignarSuplente(hojaSuplente, nombreSuplente.trim())
    setHojaSuplente(null)
    setNombreSuplente('')
    toast.show('Suplente designado • mesa blindada', 'green')
  }

  return (
    <div data-testid="page-cbe" className="flex flex-col gap-4 px-4 pb-2 pt-2">
      {/* Cinta tricolor */}
      <div className="flex h-1.5 w-full">
        <div className="flex-1 rounded-l bg-clb-primary" />
        <div className="w-2 bg-white" />
        <div className="flex-1 rounded-r bg-clb-orange" />
      </div>

      {/* Encabezado */}
      <section>
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-clb-primary">
            <span className="material-symbols-outlined text-[16px]">how_to_vote</span>
            Circunscripción 01 • Hato Mayor del Rey
          </span>
          <span className="rounded-full bg-clb-blueLight px-2 py-0.5 text-[10px] font-semibold text-clb-primaryDeep">{cbe.length} CBE Asignados</span>
        </div>
        <h2 className="font-display text-lg font-extrabold tracking-tight text-clb-ink">Comités de Base Electorales</h2>
        <p className="text-[11px] text-slate-600">Estructura orgánica por mesa de votación JCE y defensa del voto formal.</p>

        <div className="mt-2.5 flex flex-col gap-2 rounded-xl bg-white p-3.5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-clb-ink">
              <span className="material-symbols-outlined text-[18px] text-clb-orange">verified_user</span>
              Meta de Cobertura de Mesas
            </span>
            <span className="text-xs font-bold text-clb-orange">{pctCobertura}% Lista</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-clb-orange transition-all duration-500" style={{ width: `${pctCobertura}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-600">
            <span>{mesas[0]} de {mesas[1]} Mesas Cubiertas</span>
            <span className="font-semibold text-clb-orange">{mesas[1] - mesas[0]} Mesa{(mesas[1] - mesas[0]) === 1 ? '' : 's'} Crítica{(mesas[1] - mesas[0]) === 1 ? '' : 's'}</span>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="KPIs CBE" className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">{metricas.cbeResumen.delegados.pct}%</span>
          </div>
          <div>
            <span className="font-display text-xl font-bold leading-none text-clb-primary">
              {metricas.cbeResumen.delegados.listos}
              <span className="text-sm font-normal text-slate-500">/24</span>
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Delegados Listos</span>
            <span className="mt-0.5 block text-[10px] leading-tight text-slate-600">Titulares y suplentes JCE</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
              <span className="material-symbols-outlined text-[20px]">stars</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">{fmtPct(metricas.cbeResumen.pct)}</span>
          </div>
          <div>
            <span className="font-display text-xl font-bold leading-none text-clb-orange">{metricas.cbeResumen.votoDuro}</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Voto Duro CBE</span>
            <span className="mt-0.5 block text-[10px] leading-tight text-slate-600">Sello de participación formal</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setHojaCrear(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-primary font-display text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Crear Nuevo Comité CBE
      </button>

      <FilterPills
        options={FILTROS.map((f) => ({
          id: f.id,
          label: f.label,
          count: f.id === 'todos' ? cbe.length : cbe.filter((c) => c.estado === f.id).length,
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
              : 'border-slate-200 bg-slate-100 text-slate-600'
          const se = c.votoComprometido ?? { actual: 0, meta: 0 }
          const pct = se.meta > 0 ? Math.min(100, Math.round((se.actual / se.meta) * 100)) : 0
          const sinSuplente = !c.delegados?.suplente || c.delegados.suplente === 'Sin Designar'
          return (
            <article key={c.id} data-testid="cbe-card" className="rounded-xl bg-white p-3.5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clb-blueLight font-display text-sm font-bold text-clb-primary">CBE</div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold text-clb-primary">{c.nombre}</span>
                    <span className="text-[11px] text-slate-600">{c.lider} • Mesa {c.mesa}</span>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneCls}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                Código {c.codigo} • Mesa {c.mesa} • {c.recinto}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="rounded bg-slate-50 p-2">
                  <span className="block font-bold text-slate-500">Titular</span>
                  <span className="block truncate font-semibold text-clb-ink">{c.delegados?.titular || '—'}</span>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <span className="block font-bold text-slate-500">Suplente</span>
                  <span className={`block truncate font-semibold ${sinSuplente ? 'text-clb-red' : 'text-clb-ink'}`}>{c.delegados?.suplente || '—'}</span>
                </div>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-600">Voto comprometido</span>
                  <span className="text-[10px] font-bold text-clb-primary">{se.actual} de {se.meta}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-clb-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <ContactActions tel={c.telefono} waText={`Hola ${c.lider}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló.`} />
                {sinSuplente ? (
                  <button
                    type="button"
                    data-accion="asignar-suplente"
                    onClick={() => setHojaSuplente(c.id)}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-clb-orange px-3 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-orange-500"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Asignar Suplente
                  </button>
                ) : (
                  <span className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-[10px] font-bold text-emerald-800" data-estado="completo">
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                    Mesa blindada
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </section>

      {/* Taller de acreditación */}
      <section className="flex items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-card">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-bold text-clb-ink">Taller de Acreditación</span>
            <span className="text-[11px] text-slate-600">Sábado • 9:00 AM • Sede PRM Hato Mayor</span>
          </div>
        </div>
        <a
          href={`https://wa.me/1${(session?.telefono ?? '8090000000').replace(/\D/g, '')}?text=${encodeURIComponent('Confirmo asistencia al taller de acreditación CBE')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Confirmar asistencia por WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
        </a>
      </section>

      {/* Hoja: crear CBE */}
      {hojaCrear ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40" onClick={() => setHojaCrear(false)}>
          <div className="mx-auto w-full max-w-[440px] rounded-t-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <h3 className="font-display mb-1 text-base font-bold text-clb-primary">Crear Nuevo Comité CBE</h3>
            <p className="mb-4 text-xs text-slate-600">Queda por validar hasta acreditar delegados.</p>
            <form className="flex flex-col gap-3" onSubmit={crear}>
              {CAMPOS.map((c) => (
                <div key={c.id} className="flex flex-col gap-1">
                  <label htmlFor={`cbe-${c.id}`} className="text-xs font-semibold text-clb-primary">
                    {c.label}
                  </label>
                  <input
                    id={`cbe-${c.id}`}
                    value={form[c.id]}
                    onChange={(e) => setForm({ ...form, [c.id]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setHojaCrear(false)} className="h-11 flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="h-11 flex-1 rounded-lg bg-clb-primary text-sm font-bold text-white shadow-md transition-all hover:opacity-95">
                  Crear CBE
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Hoja: asignar suplente */}
      {hojaSuplente ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40" onClick={() => setHojaSuplente(null)}>
          <div className="mx-auto w-full max-w-[440px] rounded-t-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
            <h3 className="font-display mb-1 text-base font-bold text-clb-primary">Asignar Suplente</h3>
            <p className="mb-4 text-xs text-slate-600">La mesa pasa a blindado al designar al suplente.</p>
            <form className="flex flex-col gap-3" onSubmit={guardarSuplente}>
              <div className="flex flex-col gap-1">
                <label htmlFor="nombreSuplente" className="text-xs font-semibold text-clb-primary">
                  Nombre del suplente
                </label>
                <input
                  id="nombreSuplente"
                  value={nombreSuplente}
                  onChange={(e) => setNombreSuplente(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setHojaSuplente(null)} className="h-11 flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="h-11 flex-1 rounded-lg bg-clb-orange text-sm font-bold text-white shadow-md transition-all hover:opacity-95">
                  Guardar suplente
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function fmtPct(n) {
  if (n == null) return ''
  return `${Number(n).toFixed(1)}%`
}
