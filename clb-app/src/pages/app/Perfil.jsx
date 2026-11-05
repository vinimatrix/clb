import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/index.js'
import { iniciales, maskCedula } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { saltarGuardUnaVez } from '../../routes.jsx'

const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString()

/** Perfil de la sesión con cierre de sesión y restablecimiento de demo (Task 13). */
export default function Perfil() {
  const navigate = useNavigate()
  const toast = useToast()
  const { session, electores } = useAppState()
  const { logout, resetDemo } = useApp().actions

  if (!session) return null

  const inscritosHoy = electores.filter((e) => esHoy(e.createdAt) && e.registradoPor === session.username)
  const totalTareas = electores.filter((e) => e.asignadoA === session.username).length

  function cerrarSesion() {
    // flushSync: fuerza la actualización síncrona del estado (logout)
    // antes de navegar, para que el guard procese session=null
    saltarGuardUnaVez()
    flushSync(() => {
      logout()
    })
    navigate('/', { replace: true })
  }

  function restablecer() {
    if (!window.confirm('¿Restablecer todos los datos a la demo inicial? Se conservará tu cuenta.')) return
    resetDemo()
    navigate('/')
  }

  return (
    <div data-testid="page-perfil" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Encabezado */}
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={() => navigate('/app')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">Mi Perfil</h1>
      </section>

      {/* Tarjeta de identidad */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#003178] via-clb-primary to-[#1660c8] p-4 text-white shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-clb-orange/25 blur-2xl" />
        <div className="flex items-center gap-3">
          <Avatar text={iniciales(session.nombres, session.apellidos)} size={56} tone="blue" className="ring-2 ring-white/30" />
          <div className="flex min-w-0 flex-col">
            <h2 className="font-display truncate text-base font-bold tracking-tight">
              {session.nombres} {session.apellidos}
            </h2>
            <span className="text-xs text-blue-100">@{session.username}</span>
            <span className="mt-1 w-fit rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase">{session.role}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-white/10 p-2.5 text-xs">
          <span className="text-blue-100">Cédula</span>
          <span className="font-bold">{maskCedula(session.cedula)}</span>
        </div>
      </section>

      {/* Resumen de actividad */}
      <section className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="font-display mb-3 text-sm font-bold text-clb-primary">Resumen de Actividad</h3>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <div className="rounded-lg bg-clb-blueLight/50 p-3">
            <span className="font-display block text-lg font-bold text-clb-primary">{inscritosHoy.length}</span>
            <span className="text-[11px] text-slate-600">Inscritos por mí hoy</span>
          </div>
          <div className="rounded-lg bg-clb-orangeLight/50 p-3">
            <span className="font-display block text-lg font-bold text-clb-orange">{totalTareas}</span>
            <span className="text-[11px] text-slate-600">Electores en mi carpeta</span>
          </div>
        </div>
      </section>

      {/* Acciones de cuenta */}
      <section className="flex flex-col gap-2 pb-2">
        <button
          type="button"
          onClick={restablecer}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-clb-primary shadow-sm ring-1 ring-clb-primary/30 transition-all hover:bg-clb-blueLight active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          Restablecer datos demo
        </button>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-clb-red shadow-sm ring-1 ring-clb-red/30 transition-all hover:bg-red-50 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Cerrar sesión
        </button>
        <p className="text-center text-[10px] text-slate-500">
          CLB Móvil v2.4 • Proyecto Carmen Ligia Barceló — el botón restablecer vuelve todo a la demo original.
        </p>
      </section>
    </div>
  )
}
