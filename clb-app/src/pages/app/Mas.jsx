import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/Toast.jsx'
import { useApp } from '../../store/AppContext.jsx'

const ACCESOS = [
  { id: 'fidelizados', modulo: 'fidelizados', icon: 'loyalty', label: 'Fidelizados', sub: 'Electores con voto seguro', tone: 'orange', ruta: '/app/fidelizados' },
  { id: 'cba', modulo: 'cba', icon: 'groups', label: 'CBA', sub: 'Comités de base afectivos', tone: 'blue', ruta: '/app/cba' },
  { id: 'cbe', modulo: 'cbe', icon: 'ballot', label: 'CBE', sub: 'Comités electorales', tone: 'navy', ruta: '/app/cbe' },
  { id: 'callcenter', modulo: 'callcenter', icon: 'call', label: 'Call Center', sub: 'Llamadas y bitácora del día', tone: 'orange', ruta: '/app/callcenter' },
]

/** Centro Más (Task 13): grilla de accesos sin elementos muertos, filtrada por permisos. */
export default function Mas() {
  const navigate = useNavigate()
  const toast = useToast()
  const { tienePermiso } = useApp().actions

  const accesosVisibles = ACCESOS.filter((a) => tienePermiso(a.modulo))

  return (
    <div data-testid="page-mas" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={() => navigate('/app')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">Más herramientas</h1>
      </section>

      <section aria-label="Accesos del proyecto" className="grid grid-cols-2 gap-2.5">
        {accesosVisibles.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => navigate(a.ruta)}
            className="flex flex-col items-start gap-2 rounded-xl bg-white p-4 text-left shadow-card transition-transform active:scale-[0.98] hover:bg-slate-50"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                a.tone === 'orange' ? 'bg-clb-orangeLight text-clb-orange' : 'bg-clb-blueLight text-clb-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-clb-ink">{a.label}</span>
              <span className="text-[11px] leading-tight text-slate-600">{a.sub}</span>
            </div>
            <span className="material-symbols-outlined mt-auto self-end text-[18px] text-slate-400">chevron_right</span>
          </button>
        ))}
      </section>

      {/* Tarjeta de Administración - solo visible para Coordinador */}
      {tienePermiso('admin') && (
        <button
          type="button"
          onClick={() => navigate('/app/admin')}
          className="flex flex-col items-start gap-2 rounded-xl bg-white p-4 text-left shadow-card transition-transform active:scale-[0.98] hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-clb-ink">Administración</span>
            <span className="text-[11px] leading-tight text-slate-600">Panel de permisos por rol</span>
          </div>
          <span className="material-symbols-outlined mt-auto self-end text-[18px] text-slate-400">chevron_right</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => navigate('/app/perfil')}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-clb-primary shadow-sm ring-1 ring-clb-primary/30 transition-all hover:bg-clb-blueLight"
      >
        <span className="material-symbols-outlined text-[18px]">person</span>
        Ir a Mi Perfil
      </button>

      <button
        type="button"
        onClick={() => navigate('/app')}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-primary text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        Volver a Inicio
      </button>

      <p className="pb-2 text-center text-[10px] uppercase tracking-wider text-slate-500">
        CLB Móvil • Proyecto Carmen Ligia Barceló v2.4
      </p>
    </div>
  )
}
