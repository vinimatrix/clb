import { useAppState } from '../../store/AppContext.jsx'

/** Reportes y estadísticas del sistema - Solo Admin */
export default function AdminReportes() {
  const { electores, comites, llamadas, tareas, metricas } = useAppState((s) => ({
    electores: s.electores,
    comites: s.comites,
    llamadas: s.llamadas,
    tareas: s.tareas,
    metricas: s.metricas,
  }))

  const totalElectores = electores.length
  const fidelizados = electores.filter((e) => e.estado === 'fidelizado').length
  const indecisos = electores.filter((e) => e.estado === 'indeciso').length
  const totalComites = comites.length
  const totalLlamadas = llamadas.length
  const llamadasCompletadas = llamadas.filter((l) => l.completado).length
  const tareasPendientes = tareas.filter((t) => t.estado === 'pendiente').length
  const tareasCompletadas = tareas.filter((t) => t.estado === 'completada').length

  const conversionRate = totalElectores > 0 ? Math.round((fidelizados / totalElectores) * 100) : 0

  return (
    <div data-testid="page-admin-reportes" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver al panel"
          onClick={() => window.history?.back?.()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">
          Reportes y Estadísticas
        </h1>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Electores</div>
          <div className="text-2xl font-bold text-clb-ink mt-1">{totalElectores}</div>
          <div className="mt-2 text-[10px] text-slate-500">Padrón electoral completo</div>
        </div>
        <div className="rounded-xl bg-clb-primary/10 p-4 shadow-card">
          <div className="text-xs font-bold text-clb-primary uppercase tracking-wider">Fidelizados</div>
          <div className="text-2xl font-bold text-clb-primary mt-1">{fidelizados}</div>
          <div className="mt-2 text-[10px] text-clb-primary/70">{conversionRate}% de conversión</div>
        </div>
        <div className="rounded-xl bg-clb-orangeLight/50 p-4 shadow-card">
          <div className="text-xs font-bold text-clb-orange uppercase tracking-wider">Indecisos</div>
          <div className="text-2xl font-bold text-clb-orange mt-1">{indecisos}</div>
          <div className="mt-2 text-[10px] text-clb-orange/70">Por convertir</div>
        </div>
        <div className="rounded-xl bg-clb-blueLight/50 p-4 shadow-card">
          <div className="text-xs font-bold text-clb-primary uppercase tracking-wider">Comités</div>
          <div className="text-2xl font-bold text-clb-primary mt-1">{totalComites}</div>
          <div className="mt-2 text-[10px] text-clb-primary/70">CBA + CBE activos</div>
        </div>
      </div>

      {/* Métricas de actividad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Llamadas</div>
          <div className="text-2xl font-bold text-clb-ink mt-1">{totalLlamadas}</div>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] text-clb-ink">
              ✓ {llamadasCompletadas} completadas
            </span>
            <span className="text-[10px] text-slate-500">
              {totalLlamadas - llamadasCompletadas} pendientes
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tareas</div>
          <div className="text-2xl font-bold text-clb-ink mt-1">{tareasCompletadas + tareasPendientes}</div>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] text-clb-primary">
              ✓ {tareasCompletadas} completadas
            </span>
            <span className="text-[10px] text-slate-500">
              {tareasPendientes} pendientes
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Distribución por Estado</div>
          <div className="mt-3 space-y-2">
            {['fidelizado', 'indeciso', 'contactado'].map((estado) => {
              const count = electores.filter((e) => e.estado === estado).length
              const pct = totalElectores > 0 ? Math.round((count / totalElectores) * 100) : 0
              return (
                <div key={estado} className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      estado === 'fidelizado'
                        ? 'bg-clb-primary'
                        : estado === 'indeciso'
                        ? 'bg-slate-400'
                        : 'bg-clb-orange'
                    }`}
                  ></span>
                  <span className="text-xs text-slate-600 w-16">
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        estado === 'fidelizado'
                          ? 'bg-clb-primary'
                          : estado === 'indeciso'
                          ? 'bg-slate-400'
                          : 'bg-clb-orange'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 w-8 text-right">
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Métricas adicionales si existen en el seed */}
      {metricas && (
        <div className="rounded-xl bg-white p-4 shadow-card">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Métricas del Sistema</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="border-l-2 border-clb-primary pl-3">
              <div className="text-[10px] text-slate-500 uppercase">Inscritos Hoy</div>
              <div className="text-xl font-bold text-clb-ink">{metricas.inscritos ?? 0}</div>
            </div>
            <div className="border-l-2 border-clb-orange pl-3">
              <div className="text-[10px] text-slate-500 uppercase">Fidelizados Hoy</div>
              <div className="text-xl font-bold text-clb-orange">{metricas.fidelizados ?? 0}</div>
            </div>
            <div className="border-l-2 border-clb-primaryDeep pl-3">
              <div className="text-[10px] text-slate-500 uppercase">Fidelizados Circ.</div>
              <div className="text-xl font-bold text-clb-primaryDeep">{metricas.fidelizadosCirc ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center transition-colors hover:bg-slate-100 border border-slate-200"
          onClick={() => window.print?.()}
        >
          <span className="material-symbols-outlined text-[24px] text-slate-400">print</span>
          <span className="text-xs font-bold text-slate-600">Exportar PDF</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center transition-colors hover:bg-slate-100 border border-slate-200"
        >
          <span className="material-symbols-outlined text-[24px] text-slate-400">file_download</span>
          <span className="text-xs font-bold text-slate-600">Exportar CSV</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-2 rounded-xl bg-clb-primary/10 p-4 text-center transition-colors hover:bg-clb-primary/20 border border-clb-primary/20"
        >
          <span className="material-symbols-outlined text-[24px] text-clb-primary">refresh</span>
          <span className="text-xs font-bold text-clb-primary">Actualizar Datos</span>
        </button>
      </div>
    </div>
  )
}
