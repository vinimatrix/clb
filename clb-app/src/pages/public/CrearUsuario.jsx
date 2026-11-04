import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MarcaCLB, Button } from '../../components/index.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'

function badge(username, users) {
  const v = username.trim()
  if (v.length === 0) return { texto: 'Nombre de usuario', cls: 'bg-slate-100 text-slate-500 border-slate-200', libre: false }
  if (v.length < 6) return { texto: 'Mínimo 6 caracteres', cls: 'bg-amber-50 text-amber-700 border-amber-200', libre: false }
  const tomado = users.some((u) => u.username.toLowerCase() === v.toLowerCase())
  if (tomado) return { texto: 'Usuario no disponible', cls: 'bg-red-50 text-clb-red border-red-200', libre: false }
  return { texto: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', libre: true }
}

/** Paso 4 — Crear usuario (ref: stitch-reference/04-paso4-crear-usuario.html). */
export default function CrearUsuario() {
  const navigate = useNavigate()
  const { registro, users } = useAppState()
  const { actualizarRegistro } = useApp().actions
  const [username, setUsername] = useState(registro?.username ?? '')

  const b = badge(username, users)

  if (!registro?.cedula) {
    return (
      <main data-testid="page-usuario" className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-clb-muted">No hay registro en curso.</p>
        <Link to="/registro" className="mt-3 font-bold text-clb-primary underline">
          Comenzar registro
        </Link>
      </main>
    )
  }

  return (
    <main data-testid="page-usuario" className="flex min-h-dvh flex-col bg-white">
      <nav className="relative flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <Link to="/registro/confirmacion" aria-label="Volver" className="flex h-10 w-10 items-center justify-center rounded-full text-clb-navy hover:bg-slate-100">
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </Link>
        <MarcaCLB />
        <div className="w-8" />
      </nav>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-4 pt-6">
        <div>
          <div className="mb-4 inline-flex items-center space-x-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clb-orange" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-clb-primary">Paso 4 de 7 • Registro</span>
          </div>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-clb-navy">Crear usuario</h1>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-clb-muted">
              Define el nombre de usuario que utilizarás para acceder a la plataforma.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-clb-navy">
                Nombre de usuario <span className="text-clb-orange">*</span>
              </label>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>
                {b.libre ? <span className="material-symbols-outlined mr-1 text-[12px]">check</span> : null}
                {b.texto}
              </span>
            </div>
            <div className="relative">
              <input
                id="username"
                className="block w-full rounded-xl border border-slate-200 py-3.5 pl-4 pr-11 text-sm font-semibold text-clb-navy outline-none transition-all placeholder:text-slate-400 focus:border-clb-primary focus:ring-2 focus:ring-clb-primary/20"
                placeholder="Ej. clbarcelo2026"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                autoComplete="username"
              />
              {b.libre ? (
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-emerald-500">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </span>
              ) : null}
            </div>
            <div className="mt-2.5 space-y-1.5 px-1">
              <p className="flex items-start text-xs text-clb-muted">
                <span className="mt-1.5 mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Debe tener al menos 6 caracteres.
              </p>
              <p className="flex items-start text-xs text-clb-muted">
                <span className="mt-1.5 mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                Puedes usar letras, números y guiones bajos (_).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-2 pt-6">
          <Button
            variant="orange"
            disabled={!b.libre}
            onClick={() => {
              actualizarRegistro({ username: username.trim() })
              navigate('/registro/otp')
            }}
          >
            Continuar
          </Button>
          <div className="pt-2 text-center">
            <p className="text-[11px] font-semibold tracking-tight text-clb-muted">
              Gente organizada, <span className="font-bold text-clb-navy">un mejor futuro.</span>
            </p>
            <div className="mt-1 flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-slate-400">
              <span>Trabajo</span>
              <span>•</span>
              <span>Organización</span>
              <span>•</span>
              <span>Resultados</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
