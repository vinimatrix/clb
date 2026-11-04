import { useNavigate } from 'react-router-dom'
import { MetricCard, DonutChart, ProgressBar } from '../../components/index.js'
import { formatNumber } from '../../lib/format.js'
import { useAppState } from '../../store/AppContext.jsx'

const fechaCorta = () =>
  new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

/** Dashboard ejecutivo (fusión refs 10 + 11). */
export default function Dashboard() {
  const navigate = useNavigate()
  const { session, metricas } = useAppState()

  const accesos = [
    { id: 'inscripcion', label: 'Inscripción', sub: 'Registra y consulta electores', icon: 'person_add', cls: 'bg-clb-primary' },
    { id: 'recinto', label: 'Mi Recinto', sub: 'Gestiona electores del recinto', icon: 'location_on', cls: 'bg-clb-orange' },
    { id: 'carpeta', label: 'Mi Carpeta', sub: 'Electores asignados', icon: 'folder_shared', cls: 'bg-clb-primary' },
    { id: 'callcenter', label: 'Call Center', sub: 'Llamadas y seguimiento', icon: 'call', cls: 'bg-clb-orange' },
  ]

  const coberturas = [
    { label: 'Inscritos', value: metricas.cobertura.inscritos, tone: 'blue' },
    { label: 'Comités Afectivos (CBA)', value: metricas.cobertura.cba, tone: 'orange' },
    { label: 'Comités Electorales (CBE)', value: metricas.cobertura.cbe, tone: 'blue' },
    { label: 'Fidelizados', value: metricas.cobertura.fidelizados, tone: 'orange' },
  ]

  return (
    <div data-testid="page-dashboard" className="flex flex-col gap-4 px-4 pt-3">
      {/* Estado + saludo */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-clb-blueLight px-2.5 py-1 text-clb-primaryDeep">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clb-orange" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Territorio Activo</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-clb-primary">calendar_today</span>
            <span className="capitalize">{fechaCorta()}</span>
          </div>
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-clb-navy">
            ¡Hola, {session?.nombres} {session?.apellidos}!
          </h1>
          <p className="text-xs text-slate-600">Gracias por liderar este proyecto. Resumen ejecutivo de la jornada.</p>
        </div>
      </section>

      {/* Hero de campaña */}
      <section className="relative min-h-[120px] overflow-hidden rounded-2xl bg-gradient-to-r from-clb-primary to-[#1051b8] text-white shadow-lg">
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-clb-orange/25 blur-xl" />
        <div className="flex h-full w-full">
          <div className="flex w-[58%] flex-col justify-between p-3.5">
            <div>
              <span className="mb-0.5 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300">Hato Mayor</span>
              <h2 className="text-sm font-extrabold uppercase leading-tight tracking-tight">
                ¡Trabajemos <span className="text-clb-orange">juntos</span> por un mejor futuro para todos!
              </h2>
            </div>
            <p className="text-[10px] font-medium leading-tight text-blue-100">Gente organizada, un mejor futuro.</p>
          </div>
          <div className="relative flex w-[42%] items-end justify-center">
            <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/30 bg-white/10 p-3 text-center backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 fill-white" aria-hidden="true">
                <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66a1.002 1.002 0 0 0-.84-.59L14 3.05a1 1 0 0 0-.71.29L8.41 8.21C8.14 8.47 8 8.83 8 9.21V19c0 1.1.9 2 2 2h9c.8 0 1.5-.47 1.83-1.17l2.83-6.6a1.01 1.01 0 0 0 .17-.35z" />
              </svg>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-widest text-white/90">Campaña 2024–2028</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de módulos (ref 11) */}
      <section aria-label="Módulos funcionales" className="grid grid-cols-2 gap-3">
        {accesos.slice(0, 2).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => navigate(`/app/${a.id === 'callcenter' ? 'callcenter' : a.id}`)}
            className={`group flex h-[92px] flex-col justify-between rounded-xl p-3.5 text-left text-white shadow-card transition active:scale-[0.98] hover:opacity-95 ${a.cls}`}
          >
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-white/20 p-1.5">
                <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
              </span>
              <span className="material-symbols-outlined text-[16px] text-white/70 transition-transform group-hover:translate-x-0.5">chevron_right</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase leading-none tracking-wide">{a.label}</p>
              <p className="mt-0.5 text-[9.5px] text-white/80">{a.sub}</p>
            </div>
          </button>
        ))}
      </section>

      {/* KPIs ejecutivos */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-clb-primary">monitoring</span>
            <span className="text-xs font-bold uppercase tracking-wider text-clb-primary">Métricas Clave</span>
          </div>
          <span className="text-[10px] font-medium text-slate-600">Actualizado 09:30 AM</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <MetricCard
            icon={<span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
            tone="blue"
            value={formatNumber(metricas.inscritos)}
            label="Inscritos"
            sub="Padrón validado"
            delta={metricas.inscritosDelta}
            deltaTone="blue"
          />
          <MetricCard
            icon={<span className="material-symbols-outlined text-[18px]">groups</span>}
            tone="orange"
            value={formatNumber(metricas.cba)}
            label="CBA"
            sub="Comités afectivos"
            delta={metricas.cbaDelta}
            deltaTone="orange"
          />
          <MetricCard
            icon={<span className="material-symbols-outlined text-[18px]">ballot</span>}
            tone="navy"
            value={formatNumber(metricas.cbe)}
            label="CBE"
            sub="Comités electorales"
            delta={metricas.cbeDelta}
            deltaTone="gray"
          />
          <MetricCard
            icon={<span className="material-symbols-outlined text-[18px]">loyalty</span>}
            tone="green"
            value={formatNumber(metricas.fidelizados)}
            label="Fidelizados"
            sub="Voto seguro"
            delta={metricas.fidelizadosDelta}
            deltaTone="green"
          />
        </div>
      </section>

      {/* Mercado electoral */}
      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-card">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-1">
            <div className="h-1 w-3 rounded-full bg-clb-primary" />
            <div className="h-1 w-3 rounded-full bg-clb-orange" />
          </div>
          <h3 className="font-display text-sm font-bold text-clb-primary">Mercado Electoral</h3>
          <p className="text-xs text-slate-600">Distribución del padrón total frente a la meta PRM</p>
        </div>
        <div className="flex items-center justify-center py-2">
          <DonutChart percent={14.35} size={160} centerValue={`${((metricas.mercadoPrm / metricas.mercadoTotal) * 100).toFixed(2)}%`} centerLabel="Meta PRM" />
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-clb-primary" />
              <span className="text-xs font-medium text-slate-900">Total General</span>
            </div>
            <span className="text-sm font-bold text-clb-primary">{formatNumber(metricas.mercadoTotal)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-clb-orangeLight/40 p-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-clb-orange" />
              <span className="text-xs font-semibold text-[#7a3000]">PRM</span>
            </div>
            <span className="text-sm font-bold text-clb-orange">{formatNumber(metricas.mercadoPrm)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="text-xs font-medium text-slate-600">Otros Partidos</span>
            </div>
            <span className="text-sm font-bold text-slate-600">{formatNumber(metricas.mercadoOtros)}</span>
          </div>
        </div>
        <button
          type="button"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-xs font-semibold text-clb-primary transition-colors hover:bg-slate-200"
        >
          <span>PADRÓN JCE OFICIAL ▸ Ver desglose por municipio</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </section>

      {/* Cobertura */}
      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-display text-sm font-bold text-clb-primary">Cobertura de Gestión</h3>
            <p className="text-xs text-slate-600">Avance territorial respecto al objetivo fijado</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
            <span className="material-symbols-outlined text-[20px]">target</span>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 pt-1">
          {coberturas.map((c) => (
            <div key={c.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-900">{c.label}</span>
                <span className={`text-xs font-bold ${c.tone === 'blue' ? 'text-clb-primary' : 'text-clb-orange'}`}>
                  {c.value}%
                </span>
              </div>
              <ProgressBar value={c.value} tone={c.tone} height="h-2.5" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-bold uppercase text-slate-600">Meta Territorial Fijada</span>
          <button type="button" className="flex items-center gap-1 text-xs font-bold text-clb-orange hover:underline">
            <span>Actualizar metas</span>
            <span className="material-symbols-outlined text-[14px]">tune</span>
          </button>
        </div>
      </section>

      {/* Accesos rápidos (ref 10) */}
      <section className="flex flex-col gap-2 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-clb-primary">Herramientas Operativas</span>
          <span className="text-[10px] font-semibold text-slate-600">Accesos Rápidos</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" aria-label="Acceso: Inscripción" onClick={() => navigate('/app/inscripcion')} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm transition-transform active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clb-blueLight text-clb-primary">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Inscripción</span>
          </button>
          <button type="button" aria-label="Acceso: Mi Recinto" onClick={() => navigate('/app/recinto')} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm transition-transform active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clb-orangeLight text-clb-orange">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Mi Recinto</span>
          </button>
          <button type="button" aria-label="Acceso: Mi Carpeta" onClick={() => navigate('/app/carpeta')} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm transition-transform active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-clb-navy">
              <span className="material-symbols-outlined text-[20px]">folder_shared</span>
            </div>
            <span className="text-xs font-bold leading-tight text-slate-900">Mi Carpeta</span>
          </button>
        </div>
      </section>
    </div>
  )
}
