import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MarcaCLB, Button } from '../../components/index.js'
import { maskCedula, maskTelefono } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'

const Label = ({ children, requerido = false }) => (
  <label className="block text-[11.5px] font-bold uppercase tracking-wide text-slate-700">
    {children} {requerido ? <span className="text-clb-orange">*</span> : null}
  </label>
)

const inputCls =
  'h-11 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:border-clb-primary focus:bg-white focus:ring-1 focus:ring-clb-primary'

/** Paso 2 — formulario de registro (ref: stitch-reference/02-paso2-unirme.html). */
export default function Unirme() {
  const navigate = useNavigate()
  const { users } = useAppState()
  const { iniciarRegistro } = useApp().actions
  const [cedula, setCedula] = useState('')
  const [nombres, setNombres] = useState('')
  const [primerApellido, setPrimerApellido] = useState('')
  const [segundoApellido, setSegundoApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [errores, setErrores] = useState({})

  function onSubmit(e) {
    e.preventDefault()
    const err = {}
    if (cedula.replace(/\D/g, '').length !== 11) err.cedula = 'Campo requerido: 11 dígitos'
    if (!nombres.trim()) err.nombres = 'Campo requerido'
    if (!primerApellido.trim()) err.primerApellido = 'Campo requerido'
    if (telefono.replace(/\D/g, '').length !== 10) err.telefono = 'Campo requerido: 10 dígitos'
    if (Object.keys(err).length === 0) {
      const digits = cedula.replace(/\D/g, '')
      const formateada = `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`
      const duplicada = users.some((u) => u.cedula.replace(/\D/g, '') === digits)
      if (duplicada) {
        err.cedula = 'Esta cédula ya está registrada. Inicia sesión.'
      } else {
        iniciarRegistro({
          cedula: formateada,
          nombres,
          primerApellido,
          segundoApellido,
          telefono: maskTelefono(telefono),
        })
        navigate('/registro/confirmacion')
        return
      }
    }
    setErrores(err)
  }

  return (
    <main data-testid="page-registro" className="flex min-h-dvh flex-col bg-white">
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 pb-3 pt-5">
        <div className="relative flex min-h-[48px] items-center justify-center">
          <Link to="/" aria-label="Volver" className="absolute left-0 rounded-full p-2 text-clb-navy hover:bg-slate-50">
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </Link>
          <MarcaCLB />
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-4">
        <div>
          <section className="mb-5 text-left">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-clb-primary/10 px-2 py-0.5 text-[11px] font-bold text-clb-primary">Paso 2</span>
              <span className="text-xs font-semibold text-slate-400">Registro de nuevos miembros</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-clb-navy">Unirme al Proyecto</h1>
            <p className="mt-1 text-xs leading-relaxed text-clb-muted">Completa tu información para formar parte de nuestro equipo.</p>
          </section>

          <form className="space-y-3.5" onSubmit={onSubmit} noValidate>
            <div className="space-y-1">
              <Label requerido>Número de cédula</Label>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="Ej. 00112345678"
                value={cedula}
                onChange={(e) => setCedula(maskCedula(e.target.value))}
              />
              {errores.cedula ? (
                <p className="text-xs font-semibold text-clb-red" role="alert">
                  {errores.cedula}{' '}
                  {errores.cedula.includes('registrada') ? (
                    <Link to="/login" className="font-bold text-clb-primary underline">
                      Inicia sesión
                    </Link>
                  ) : null}
                </p>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label requerido>Nombre</Label>
              <input className={inputCls} placeholder="Tu nombre" value={nombres} onChange={(e) => setNombres(e.target.value)} />
              {errores.nombres ? <p className="text-xs font-semibold text-clb-red">{errores.nombres}</p> : null}
            </div>
            <div className="space-y-1">
              <Label requerido>Primer apellido</Label>
              <input className={inputCls} placeholder="Tu primer apellido" value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} />
              {errores.primerApellido ? <p className="text-xs font-semibold text-clb-red">{errores.primerApellido}</p> : null}
            </div>
            <div className="space-y-1">
              <Label>Segundo apellido</Label>
              <input className={inputCls} placeholder="Tu segundo apellido (opcional)" value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label requerido>Teléfono celular</Label>
              <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-clb-primary focus-within:ring-1 focus-within:ring-clb-primary">
                <div className="inline-flex select-none items-center gap-1.5 border-r border-slate-200 bg-slate-100 px-3 text-slate-600">
                  <span className="inline-block h-3 w-4 overflow-hidden rounded-[2px] border border-slate-300 bg-[#002D62]">
                    <span className="block h-1/2 w-full translate-y-1/2 bg-[#CE1126]" />
                  </span>
                  <span className="text-xs font-semibold">DO</span>
                </div>
                <input
                  className="h-11 w-full px-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  inputMode="tel"
                  placeholder="(829) 123-4567"
                  value={telefono}
                  onChange={(e) => setTelefono(maskTelefono(e.target.value))}
                />
              </div>
              {errores.telefono ? <p className="text-xs font-semibold text-clb-red">{errores.telefono}</p> : null}
            </div>
            <div className="pt-3">
              <Button type="submit" variant="orange">
                Continuar
              </Button>
            </div>
          </form>
        </div>

        <div className="py-2 text-center">
          <p className="text-[11px] text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-bold text-clb-primary underline underline-offset-2 hover:text-clb-orange">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <footer className="flex flex-col items-center gap-1.5 border-t border-slate-100 pb-5 pt-3">
        <div className="flex h-1 w-24 overflow-hidden rounded-full">
          <div className="flex-1 bg-clb-navy" />
          <div className="flex-1 border-x border-slate-200 bg-white" />
          <div className="flex-1 bg-clb-orange" />
        </div>
        <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
          Trabajo <span className="text-clb-orange">•</span> Organización <span className="text-clb-orange">•</span> Resultados
        </p>
      </footer>
    </main>
  )
}
