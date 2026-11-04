import { Link, useNavigate } from 'react-router-dom'
import { MarcaCLB, Button, Avatar, Badge } from '../../components/index.js'
import { iniciales } from '../../lib/format.js'
import { useAppState } from '../../store/AppContext.jsx'

/** Paso 7 — Cuenta creada exitosamente (ref: stitch-reference/07-paso7-exito.html). */
export default function Exito() {
  const navigate = useNavigate()
  const { users } = useAppState()
  const nueva = users[users.length - 1]

  return (
    <main data-testid="page-exito" className="flex min-h-dvh flex-col bg-white">
      <header className="flex flex-col items-center border-b border-slate-100 px-5 pt-5">
        <div className="relative flex w-full items-center justify-center py-3">
          <Link to="/" aria-label="Inicio" className="absolute left-0 rounded-full p-1.5 text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </Link>
          <MarcaCLB />
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6 text-center">
        <div className="relative mb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-100 bg-green-50 shadow-inner">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-md">
              <span className="material-symbols-outlined text-[40px] text-white">check</span>
            </div>
          </div>
        </div>

        <h1 className="mb-3 font-display text-2xl font-black leading-tight tracking-tight text-clb-navy">
          ¡Cuenta creada
          <br />
          exitosamente!
        </h1>
        <p className="mb-6 max-w-[290px] text-sm leading-relaxed text-slate-600">
          Ya formas parte del Proyecto Carmen Ligia Barceló. Ahora puedes iniciar sesión y acceder a todas las
          herramientas de la plataforma.
        </p>

        {nueva ? (
          <div className="mb-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left shadow-sm">
            <div className="flex items-center space-x-3">
              <Avatar text={iniciales(nueva.nombres, nueva.apellidos)} size={40} tone="light" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Usuario Registrado</p>
                <p className="truncate text-sm font-bold text-clb-navy">@{nueva.username}</p>
              </div>
              <div className="text-right">
                <Badge tone="green">Activo</Badge>
                <p className="mt-0.5 text-[10px] text-slate-400">Rol: {nueva.role}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Paso 7 de 7 completado</span>
        </div>
      </section>

      <footer className="flex w-full flex-col items-center border-t border-slate-100 bg-white px-6 pb-6 pt-2">
        <Button variant="orange" size="lg" onClick={() => navigate('/login')}>
          Ir a iniciar sesión
        </Button>
        <div className="mt-4 flex flex-col items-center justify-center space-y-1 text-center">
          <div className="mb-0.5 flex items-center space-x-1">
            <span className="h-0.5 w-4 rounded-full bg-[#002B66]" />
            <span className="h-0.5 w-4 rounded-full border-t border-slate-300 bg-white" />
            <span className="h-0.5 w-4 rounded-full bg-[#CE1126]" />
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">República Dominicana</p>
          <p className="text-[10px] font-bold tracking-tight text-clb-navy">TRABAJO • ORGANIZACIÓN • RESULTADOS</p>
        </div>
      </footer>
    </main>
  )
}
