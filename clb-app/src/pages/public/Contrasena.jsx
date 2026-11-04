import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MarcaCLB, Button, Icon } from '../../components/index.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'

const REGLAS = [
  { id: 'len', texto: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
  { id: 'mayus', texto: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { id: 'minus', texto: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { id: 'num', texto: 'Un número', test: (v) => /\d/.test(v) },
  { id: 'esp', texto: 'Un carácter especial (ej. ! @ # $ %)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

function CampoPassword({ id, label, value, onChange }) {
  const [ver, setVer] = useState(false)
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={ver ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••••••"
          autoComplete={id === 'password' ? 'new-password' : 'off'}
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-3.5 pr-10 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-clb-primary focus:outline-none focus:ring-2 focus:ring-clb-primary/30"
        />
        <button
          type="button"
          aria-label={ver ? 'Ocultar contraseña' : 'Ver contraseña'}
          onClick={() => setVer(!ver)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          <Icon name={ver ? 'visibility_off' : 'visibility'} size={18} />
        </button>
      </div>
    </div>
  )
}

/** Paso 6 — Crear contraseña con checklist en vivo (ref: stitch-reference/06). */
export default function Contrasena() {
  const navigate = useNavigate()
  const { registro } = useAppState()
  const { registrarCuenta, limpiarRegistro } = useApp().actions
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errorCoincidencia, setErrorCoincidencia] = useState(false)
  const [errorBackend, setErrorBackend] = useState(null)

  if (!registro?.cedula) {
    return (
      <main data-testid="page-contrasena" className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-clb-muted">No hay registro en curso.</p>
        <Link to="/registro" className="mt-3 font-bold text-clb-primary underline">
          Comenzar registro
        </Link>
      </main>
    )
  }

  const todas = REGLAS.every((r) => r.test(password))
  const coinciden = password.length > 0 && password === confirmar
  const desajusteVisible = !coinciden && confirmar.length > 0
  const habilitado = todas && coinciden

  function onSubmit(e) {
    e.preventDefault()
    if (!habilitado) {
      if (!coinciden) setErrorCoincidencia(true)
      return
    }
    setErrorCoincidencia(false)
    const res = registrarCuenta({
      cedula: registro.cedula,
      username: registro.username,
      password,
      nombres: registro.nombres,
      apellidos: `${registro.primerApellido} ${registro.segundoApellido ?? ''}`.trim(),
      telefono: registro.telefono,
    })
    if (!res.ok) {
      setErrorBackend(res.error)
      return
    }
    limpiarRegistro()
    navigate('/registro/exito')
  }

  return (
    <main data-testid="page-contrasena" className="flex min-h-dvh flex-col bg-white">
      <header className="px-6 pt-5">
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <Link to="/registro/otp" aria-label="Volver" className="p-1 text-slate-700 hover:text-slate-950">
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </Link>
          <MarcaCLB />
          <div className="w-4" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Crear contraseña</h1>
          <p className="mt-0.5 text-xs text-slate-500">Define una contraseña segura para tu acceso</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <CampoPassword id="password" label="Contraseña" value={password} onChange={setPassword} />

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <ul className="space-y-2 text-xs">
              {REGLAS.map((r) => {
                const ok = r.test(password)
                return (
                  <li key={r.id} className={`flex items-center gap-2 font-medium ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        ok ? 'bg-emerald-100' : 'bg-slate-200'
                      }`}
                    >
                      {ok ? <Icon name="check" size={12} className="text-emerald-600" /> : null}
                    </span>
                    <span>{r.texto}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <CampoPassword id="confirmPassword" label="Confirmar contraseña" value={confirmar} onChange={setConfirmar} />
          {desajusteVisible || errorCoincidencia ? (
            <p className="text-xs font-semibold text-clb-red" role="alert">
              Las contraseñas no coinciden.
            </p>
          ) : null}
          {errorBackend ? (
            <p className="text-xs font-semibold text-clb-red" role="alert">
              {errorBackend}
            </p>
          ) : null}
        </form>
      </div>

      <footer className="flex shrink-0 flex-col items-center gap-4 border-t border-slate-50 bg-white p-6">
        <Button variant="orange" onClick={onSubmit} disabled={!habilitado}>
          Continuar
        </Button>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Trabajo • Organización • Resultados
        </p>
      </footer>
    </main>
  )
}
