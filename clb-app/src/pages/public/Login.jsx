import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { maskCedula } from '../../lib/format.js'
import { useToast } from '../../components/Toast.jsx'

function LogoMarca() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 rounded-full bg-clb-primary items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
          thumb_up
        </span>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[13px] font-extrabold leading-tight tracking-tight text-clb-primary">CARMEN LIGIA</span>
        <span className="text-[10px] font-bold leading-none tracking-widest text-clb-orange">BARCELÓ</span>
      </div>
    </div>
  )
}

const inputCls =
  'h-12 w-full rounded-lg bg-slate-50 px-3.5 text-[15px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:shadow-md focus:ring-1 focus:ring-clb-primary'

/** Paso 8 — Iniciar sesión (ref: stitch-reference/08-paso8-login.html). */
export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const { users } = useAppState()
  const { login } = useApp().actions
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState(null)
  // Evita que el guard de sesión dispute la navegación a /validando tras logear.
  const recienLogeado = useRef(false)

  // Con sesión activa, el login es innecesario: aterriza directo en la app.
  if (useAppState((s) => s.session) && !recienLogeado.current) return <Navigate to="/app" replace />

  function onSubmit(e) {
    e.preventDefault()
    const res = login(cedula, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setError(null)
    recienLogeado.current = true
    navigate('/validando')
  }

  return (
    <main data-testid="page-login" className="flex min-h-dvh flex-col bg-clb-surface">
      <header className="fixed inset-x-0 top-0 z-50 bg-clb-surface/80 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[440px] items-center justify-between px-4">
          <button
            type="button"
            aria-label="Volver"
            onClick={() => navigate('/')}
            className="flex h-11 w-11 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-200/40"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </button>
          <LogoMarca />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clb-primary">
            <span className="material-symbols-outlined text-[18px] text-white">person</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-4 pb-6 pt-16">
        {/* Cinta cívica */}
        <div className="my-3 flex items-center justify-center gap-1.5">
          <div className="h-1 w-8 rounded-full bg-clb-primary" />
          <div className="h-1 w-3 rounded-full bg-slate-300" />
          <div className="h-1 w-8 rounded-full bg-clb-red" />
        </div>

        <div className="flex w-full flex-col rounded-xl bg-white p-5 shadow-sm">
          {/* Saludo */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-clb-primary/10 p-2.5 shadow-inner">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clb-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col">
              <h1 className="font-display text-xl font-bold tracking-tight text-clb-primary">Bienvenido</h1>
              <p className="text-[15px] font-medium text-slate-600">Inicia sesión para continuar.</p>
            </div>
          </div>

          <form className="mt-1 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {/* Cédula */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cedulaInput" className="flex items-center gap-1.5 text-sm font-semibold text-clb-primary">
                <span className="material-symbols-outlined text-[18px] text-clb-primary">badge</span>
                Cédula de Identidad
              </label>
              <div className="relative flex items-center">
                <input
                  id="cedulaInput"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="username"
                  maxLength={13}
                  placeholder="001-1234567-8"
                  value={cedula}
                  onChange={(e) => setCedula(maskCedula(e.target.value))}
                  className={inputCls}
                />
                <button
                  type="button"
                  aria-label="Escanear cédula"
                  onClick={() => toast.show('Escáner disponible en la versión con cámara', 'dark')}
                  className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-clb-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </button>
              </div>
              <span className="px-1 text-[11px] text-slate-600">Formato dominicano: 11 dígitos con guiones</span>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="passwordInput" className="flex items-center gap-1.5 text-sm font-semibold text-clb-primary">
                <span className="material-symbols-outlined text-[18px] text-clb-primary">lock</span>
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="passwordInput"
                  type={ver ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  aria-label="Mostrar o esconder contraseña"
                  onClick={() => setVer(!ver)}
                  className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-clb-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">{ver ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-xs font-semibold text-clb-red" role="alert">
                {error}
              </p>
            ) : null}

            <div className="-mt-1 flex justify-end">
              <button
                type="button"
                onClick={() => toast.show('Disponible en la versión con backend')}
                className="py-1 text-sm font-semibold text-clb-primary transition-colors hover:text-clb-primaryDeep"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Chip demo */}
            <div className="rounded-lg border border-dashed border-clb-primary/40 bg-clb-blueLight/40 px-3 py-2 text-[11px] font-semibold text-clb-primaryDeep">
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                <span>
                  Demo:{' '}
                  <span data-testid="demo-ced">402-1234567-8</span> / <span>ClbSegura2026@</span>
                </span>
              </p>
            </div>

            <button
              type="submit"
              className="mt-1 flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-clb-orange font-display text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
            >
              <span>Iniciar sesión</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1">arrow_forward</span>
            </button>
          </form>

          {/* Separador */}
          <div className="relative flex items-center py-1">
            <div className="h-px flex-grow bg-slate-200" />
            <span className="shrink-0 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">O regístrate</span>
            <div className="h-px flex-grow bg-slate-200" />
          </div>

          {/* Crear cuenta */}
          <Link
            to="/registro"
            className="group flex w-full items-center justify-between rounded-lg bg-slate-50 p-3.5 shadow-sm transition-all hover:bg-slate-100 active:scale-[0.99]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clb-blueLight">
                <span className="material-symbols-outlined text-[20px] text-clb-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_add
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-clb-primary">Crear una cuenta</span>
                <span className="truncate text-xs text-slate-600">Si aún no eres miembro del proyecto</span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-clb-primary">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </div>
          </Link>
        </div>

        {/* Aviso de seguridad */}
        <div className="mt-4 flex items-center justify-center gap-2 px-2 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-clb-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <p className="text-center text-[11px] font-medium">Plataforma Oficial de Gestión Territorial • Cifrado Seguro</p>
        </div>
      </div>

      <footer className="mt-auto flex w-full flex-col items-center justify-center gap-2 bg-clb-surface/90 py-4 pb-safe backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-4 rounded-full bg-clb-primary" />
          <div className="h-1 w-4 rounded-full bg-clb-red" />
        </div>
        <p className="text-center text-[11px] uppercase tracking-wider text-slate-600">TRABAJO • ORGANIZACIÓN • RESULTADOS</p>
      </footer>
    </main>
  )
}
