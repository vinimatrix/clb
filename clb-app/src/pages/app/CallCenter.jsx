import { useMemo, useState } from 'react'
import { Avatar } from '../../components/index.js'
import { maskCedula, iniciales } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const INTENCIONES = [
  { id: 'voto-seguro', label: 'Voto Seguro CLB', icon: 'check_circle' },
  { id: 'simpatizante', label: 'Simpatizante', icon: 'thumb_up' },
  { id: 'indeciso', label: 'Indeciso', icon: 'help_outline' },
  { id: 'oposicion', label: 'No Apoya / Opos.', icon: 'cancel' },
]

const TRANSPORTES = [
  { id: 'ruta-b3', label: 'Sí: Requiere Transporte (Ruta B-3 Hato Mayor)', icon: 'directions_bus' },
  { id: 'propio', label: 'Vehículo propio', icon: 'directions_car' },
  { id: 'no', label: 'No requiere', icon: 'close' },
]

const HORARIOS = [
  { id: 'manana', label: 'Mañana', sub: '8:00 – 12:00 M', icon: 'wb_sunny' },
  { id: 'tarde', label: 'Tarde', sub: '2:00 – 5:00 PM', icon: 'nights_stay' },
  { id: 'noche', label: 'Noche', sub: 'Después de 6 PM', icon: 'bedtime' },
]

const MOTIVO_ESTILO = {
  reintento: { icon: 'phone_missed', cls: 'bg-clb-orangeLight text-clb-orange', subCls: 'text-clb-orange' },
  agendada: { icon: 'schedule', cls: 'bg-clb-blueLight text-clb-primary', subCls: 'text-clb-primary' },
  confirmar: { icon: 'location_on', cls: 'bg-emerald-50 text-emerald-700', subCls: 'text-emerald-700' },
}

const chipInactivo =
  'rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200'
const chipActivo = 'rounded-lg bg-clb-primary text-white shadow-sm'

/** Call Center — Tele-Validación Electoral (ref: stitch-reference/19-callcenter.html). */
export default function CallCenter() {
  const toast = useToast()
  const { electores, llamadas } = useAppState()
  const { tipificarElector } = useApp().actions

  const cuota = llamadas.metaDiaria
  const completadas = llamadas.completadasHoy
  const pctCuota = Math.round((completadas / cuota) * 100)
  const restantes = Math.max(0, cuota - completadas)

  // Ficha activa: primer elector de la agenda sin intento tipificado.
  const sinTipificar = useMemo(() => electores.filter((e) => !e.intento), [electores])
  const [activa, setActiva] = useState(null) // elector del dossier
  const [guionAbierto, setGuionAbierto] = useState(true)
  const [intencion, setIntencion] = useState(null)
  const [transporte, setTransporte] = useState(null)
  const [horario, setHorario] = useState(null)
  const [nota, setNota] = useState('')

  const cuotaCompleta = sinTipificar.length === 0

  function iniciar(e) {
    e.preventDefault()
    if (cuotaCompleta) {
      toast.show('Cuota completada: no quedan fichas pendientes')
      return
    }
    setActiva(sinTipificar[0])
    setIntencion(null)
    setTransporte(null)
    setHorario(null)
    setNota('')
  }

  function guardar(e) {
    e.preventDefault()
    if (!activa || !intencion) {
      toast.show('Selecciona la intención de voto primero')
      return
    }
    tipificarElector(activa.id, { intencion, transporte, horario, nota: nota.trim() })
    toast.show('Contacto tipificado con éxito. Cargando siguiente...', 'green')
    const siguientes = electores.filter((x) => !x.intento && x.id !== activa.id)
    setActiva(siguientes[0] ?? null)
    setIntencion(null)
    setTransporte(null)
    setHorario(null)
    setNota('')
  }

  return (
    <div data-testid="page-callcenter" className="flex flex-col gap-3 px-4 pb-2 pt-3">
      {/* Hero operativo */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-clb-primary to-[#003178] p-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-clb-orange/20 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="mb-1.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              En línea • Turno Matutino
            </span>
            <h2 className="font-display text-base font-bold tracking-tight">Tele-Validación Electoral</h2>
            <p className="text-[11px] text-blue-100">Circunscripción 01 • Sala Territorial Central</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <span className="material-symbols-outlined text-[26px]">headset_mic</span>
          </div>
        </div>
        <div className="relative z-10 mt-3 rounded-lg bg-white/10 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold">Meta de Llamadas Hoy</span>
            <span className="font-display text-sm font-bold text-amber-300">
              {completadas} <span className="text-[11px] font-normal text-blue-100">/ {cuota} ({pctCuota}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-clb-primaryDeep">
            <div className="h-full rounded-full bg-clb-orange transition-all duration-500" style={{ width: `${pctCuota}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-blue-100">
            <span>{restantes} restantes para completar cuota</span>
            <span className="font-bold text-amber-300">Ritmo: {llamadas.ritmo}</span>
          </div>
        </div>
      </section>

      {/* Métricas bento */}
      <section aria-label="Métricas del call center" className="grid grid-cols-3 gap-2 md:grid-cols-6">
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <span className="font-display block text-base font-bold leading-tight text-clb-ink">{llamadas.votosSeguros}</span>
            <span className="text-[9px] font-medium leading-tight text-slate-600">Votos Seguros Validados</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-clb-orangeLight text-clb-orange">
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
          </div>
          <div>
            <span className="font-display block text-base font-bold leading-tight text-clb-orange">{llamadas.transporte}</span>
            <span className="text-[9px] font-medium leading-tight text-slate-600">Solicitan Transporte</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-white p-3 shadow-card">
          <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-clb-blueLight text-clb-primary">
            <span className="material-symbols-outlined text-[18px]">phone_callback</span>
          </div>
          <div>
            <span className="font-display block text-base font-bold leading-tight text-clb-primary">{llamadas.reintentos}</span>
            <span className="text-[9px] font-medium leading-tight text-slate-600">Por Reintentar</span>
          </div>
        </div>
      </section>

      {/* Acción principal / estado de cuota */}
      {cuotaCompleta ? (
        <section className="rounded-xl bg-white p-5 text-center shadow-card">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">task_alt</span>
          </div>
          <p className="font-display text-sm font-bold text-clb-ink">Cuota completada</p>
          <p className="mt-1 text-xs text-slate-600">
            {completadas} de {cuota} llamadas tipificadas hoy. Quedan {Math.max(0, electores.length - llamadas.historial.length)} fichas en agenda.
          </p>
        </section>
      ) : (
        <form onSubmit={iniciar}>
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-clb-primary font-display text-sm font-bold text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            Iniciar Siguiente Asignada
          </button>
        </form>
      )}

      {/* Dossier + tipificación */}
      {activa ? (
        <section className="flex flex-col gap-3">
          <article className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between pb-3">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Ficha Activa en Línea
              </span>
              <span className="rounded-full bg-clb-blueLight px-2 py-0.5 text-[10px] font-semibold text-clb-primaryDeep">{activa.cba}</span>
            </div>
            <div className="flex items-start gap-3 pt-3">
              <Avatar text={iniciales(activa.nombres, activa.apellidos)} size={52} tone="light" />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="font-display text-sm font-bold leading-snug text-clb-ink">
                  {activa.nombres} {activa.apellidos}
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Cédula: <span className="font-semibold text-clb-ink">{maskCedula(activa.cedula)}</span> • {activa.edad} años
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-clb-primary">
                  <span className="material-symbols-outlined text-[14px]">diversity_3</span>
                  Vínculo: {activa.cba}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recinto Oficial JCE</span>
              <p className="text-sm font-semibold text-clb-ink">{activa.recinto}</p>
              <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px]">Mesa {activa.mesa}</span>
                •
                <span>Padrón: <strong>{activa.orden}</strong></span>
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`tel:${String(activa.telefono).replace(/\D/g, '')}`}
                className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                Llamar ({formatTel(activa.telefono)})
              </a>
              <a
                href={`https://wa.me/1${String(activa.telefono).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${activa.nombres}, del equipo de Carmen Ligia Barceló: ¿estás lista para el Día D?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600">chat</span>
                WhatsApp Directo
              </a>
            </div>
          </article>

          <form className="flex flex-col gap-3.5 rounded-xl bg-white p-4 shadow-card" onSubmit={guardar}>
            {/* Guion colapsable */}
            <div className="rounded-xl bg-clb-blueLight/60 p-3">
              <button
                type="button"
                aria-expanded={guionAbierto}
                onClick={() => setGuionAbierto((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-clb-primary">
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                  Guion Sugerido de Llamada
                </span>
                <span className="material-symbols-outlined text-[20px] text-clb-primary">{guionAbierto ? 'expand_less' : 'expand_more'}</span>
              </button>
              {guionAbierto ? (
                <p className="mt-2 text-xs italic leading-relaxed text-slate-600">
                  "¡Hola, {activa.nombres}! Saludos de parte de Carmen Ligia Barceló. Te contactamos de tu equipo en Hato Mayor para confirmar
                  que tienes tu recinto listo en el {activa.recinto} y validar cómo te apoyaremos con el traslado este domingo."
                </p>
              ) : null}
            </div>

            {/* Intención */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-clb-ink">
                <span className="h-3.5 w-1.5 rounded-full bg-clb-orange" />
                Intención de Voto Reconfirmada
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTENCIONES.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    aria-pressed={intencion === op.id}
                    onClick={() => setIntencion(op.id)}
                    className={`flex h-11 items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                      intencion === op.id ? chipActivo : chipInactivo
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{op.icon}</span>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transporte */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-clb-ink">
                <span className="h-3.5 w-1.5 rounded-full bg-clb-primary" />
                Logística de Movilización (Día D)
              </label>
              <div className="flex flex-col gap-1.5">
                {TRANSPORTES.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    aria-pressed={transporte === op.id}
                    onClick={() => setTransporte(op.id)}
                    className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-xs font-bold transition-all active:scale-95 ${
                      transporte === op.id ? 'bg-clb-orange text-white shadow-sm' : chipInactivo
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">{op.icon}</span>
                      {op.label}
                    </span>
                    {transporte === op.id ? <span className="material-symbols-outlined text-[18px]">check</span> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-bold text-clb-ink">
                <span className="h-3.5 w-1.5 rounded-full bg-clb-primaryDeep" />
                Horario de Contacto
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    aria-pressed={horario === op.id}
                    onClick={() => setHorario(op.id)}
                    className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg transition-all active:scale-95 ${
                      horario === op.id ? 'bg-clb-primaryDeep text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold">{op.label}</span>
                    <span className="text-[9px]">{op.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nota */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notaTerritorial" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Nota u Observación Territorial
              </label>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                <span className="material-symbols-outlined text-[20px] text-slate-400">edit_note</span>
                <input
                  id="notaTerritorial"
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej: Llamar a su hija para coordinar vehículo..."
                  className="w-full bg-transparent text-sm text-clb-ink outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-clb-primaryDeep font-display text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
              Guardar y Pasar al Siguiente
            </button>
          </form>
        </section>
      ) : null}

      {/* Cola prioritaria */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-clb-primary">pending_actions</span>
            <h3 className="font-display text-sm font-bold text-clb-ink">Cola Prioritaria de Hoy</h3>
          </div>
          <span className="rounded-full bg-clb-blueLight px-2 py-0.5 text-[10px] font-bold text-clb-primary">{llamadas.cola.length} Próximos</span>
        </div>
        {llamadas.cola.map((c) => {
          const estilo = MOTIVO_ESTILO[c.motivo] ?? MOTIVO_ESTILO.confirmar
          return (
            <article key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-card">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${estilo.cls}`}>
                  <span className="material-symbols-outlined text-[20px]">{estilo.icon}</span>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-clb-ink">{c.nombre}</span>
                  <span className={`text-[11px] font-medium ${estilo.subCls}`}>
                    {c.motivo === 'reintento' ? 'Reintento' : c.motivo === 'agendada' ? 'Agendada' : 'Confirmación'} • {c.detalle}
                  </span>
                  <span className="text-[10px] text-slate-500">{c.recinto}</span>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Llamar a ${c.nombre}`}
                onClick={() => toast.show(`Llamada en cola: ${c.nombre}`)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-clb-primary transition-colors hover:bg-clb-primary hover:text-white"
              >
                {c.motivo === 'agendada' ? (
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                ) : c.motivo === 'confirmar' ? (
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">call</span>
                )}
              </button>
            </article>
          )
        })}
      </section>

      {/* Banner motivacional */}
      <section className="relative overflow-hidden rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-3.5">
          <Avatar text="CLB" size={48} tone="blue" />
          <div className="flex min-w-0 flex-col">
            <p className="text-xs font-bold text-clb-ink">"Cada llamada es un voto que se cuida."</p>
            <p className="text-[10px] text-slate-600">Carmen Ligia Barceló • Candidata a Diputada</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function formatTel(tel) {
  const d = String(tel).replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : tel
}
