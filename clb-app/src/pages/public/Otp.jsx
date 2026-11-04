import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MarcaCLB, Button, Icon } from '../../components/index.js'
import { digitsOnly } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'

/** Paso 5 — Validación SMS/OTP simulada (ref: stitch-reference/05-paso5-otp.html). */
export default function Otp() {
  const navigate = useNavigate()
  const { otp } = useAppState()
  const { generarOtp } = useApp().actions
  const [digitos, setDigitos] = useState(['', '', '', '', ''])
  const [error, setError] = useState(false)
  const [restante, setRestante] = useState(60)
  const refs = useRef([])

  // Genera el código al montar si no hay uno activo.
  useEffect(() => {
    if (!otp) generarOtp()
  }, [otp, generarOtp])

  // Temporizador de reenvío.
  useEffect(() => {
    const id = setInterval(() => setRestante((s) => (s <= 0 ? 0 : s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  function setDigito(i, v) {
    const d = digitsOnly(v, 1)
    setDigitos((prev) => {
      const next = [...prev]
      next[i] = d
      return next
    })
    if (d && i < 4) refs.current[i + 1]?.focus()
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digitos[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function onPaste(e, i = 0) {
    e.preventDefault()
    const d = digitsOnly(e.clipboardData.getData('text'), 5)
    if (!d) return
    setDigitos((prev) => {
      const next = [...prev]
      d.split('').forEach((c, k) => {
        if (i + k < 5) next[i + k] = c
      })
      return next
    })
    refs.current[Math.min(i + d.length, 4)]?.focus()
  }

  function onSubmit(e) {
    e.preventDefault()
    const completo = digitos.join('')
    if (completo.length < 5) {
      setError(true)
      return
    }
    if (!otp || completo !== otp.code) {
      setError(true)
      return
    }
    setError(false)
    navigate('/registro/contrasena')
  }

  function reenviar() {
    if (restante > 0) return
    setDigitos(['', '', '', '', ''])
    setError(false)
    setRestante(60)
    generarOtp()
  }

  return (
    <main data-testid="page-otp" className="flex min-h-dvh flex-col bg-white">
      <header className="border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="relative flex items-center justify-center py-2">
          <button
            type="button"
            onClick={() => navigate('/registro/usuario')}
            aria-label="Volver"
            className="absolute left-0 rounded-full p-1.5 text-clb-primary transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          <MarcaCLB />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-start px-6 pb-4 pt-7 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-clb-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-clb-orange" />
          <span>Paso 5 de 7: Validación de seguridad</span>
        </div>
        <h1 className="mb-2 font-display text-2xl font-black tracking-tight text-clb-navy">Validación de seguridad</h1>
        <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-600">
          Te hemos enviado un código de verificación por SMS al número{' '}
          <span className="mt-0.5 block text-base font-bold tracking-wide text-slate-900">
            {useAppStateTelefonoPlaceholder()}
          </span>
        </p>

        {/* Chip del SMS simulado (demo sin backend) */}
        <div className="mb-6 w-full max-w-xs rounded-xl border border-dashed border-clb-primary/40 bg-clb-blueLight/40 px-3 py-2.5 text-left">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-clb-primary">
            <Icon name="sms" size={16} />
            SMS de demostración: tu código es <strong className="font-display text-sm tracking-widest">{otp?.code ?? '·····'}</strong>
          </p>
        </div>

        <form className="w-full max-w-xs" onSubmit={onSubmit} noValidate>
          <div className="mb-8 flex items-center justify-between gap-2.5">
            {digitos.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                aria-label={`Dígito ${i + 1}`}
                autoFocus={i === 0}
                inputMode="numeric"
                type="text"
                maxLength={1}
                value={d}
                onChange={(e) => setDigito(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={(e) => onPaste(e, i)}
                className={`h-14 w-12 rounded-xl border-2 bg-slate-50 text-center font-display text-2xl font-extrabold text-clb-navy shadow-sm outline-none transition-all focus:border-clb-orange focus:bg-white focus:ring-4 focus:ring-orange-100 ${
                  error ? 'border-clb-red' : d ? 'border-clb-orange' : 'border-slate-200'
                }`}
              />
            ))}
          </div>
          {error ? (
            <p className="mb-4 text-sm font-semibold text-clb-red" role="alert">
              Código incorrecto, intenta de nuevo.
            </p>
          ) : null}
          <div className="space-y-1.5 text-center">
            <p className="text-xs font-medium text-slate-500">¿No recibiste el código?</p>
            <button
              type="button"
              onClick={reenviar}
              disabled={restante > 0}
              className="inline-flex items-center gap-1 text-sm font-bold text-clb-primary transition hover:underline disabled:opacity-60"
            >
              <span>Reenviar código</span>
              <span className="text-xs font-normal text-slate-400">
                {restante > 0 ? `(00:${String(restante).padStart(2, '0')})` : '(Disponible)'}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-400">
          <Icon name="lock" size={16} className="text-emerald-500" />
          <span>Código SMS seguro y encriptado</span>
        </div>
      </div>

      <footer className="flex flex-col items-center gap-4 border-t border-slate-50 bg-white p-6 pb-6 pt-2">
        <Button type="submit" variant="orange" size="lg" form="otp-form" onClick={onSubmit}>
          Continuar
        </Button>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Trabajo • Organización • Resultados
        </p>
      </footer>
    </main>
  )
}

/** Teléfono del draft de registro para el copy (o genérico). */
function useAppStateTelefonoPlaceholder() {
  return useAppState((s) => s.registro?.telefono ?? '(829) 000-0000')
}
