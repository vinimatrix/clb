import { useState } from 'react'
import { ProgressBar, Avatar, ContactActions } from '../../components/index.js'
import { maskCedula, maskTelefono, iniciales } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const META_SEMANAL = 50
const OPCIONES_FIDELIZACION = [
  { id: 'fidelizado', label: 'Fidelizado' },
  { id: 'simpatizante', label: 'Simpatizante' },
  { id: 'indeciso', label: 'Indeciso' },
]
const CBAS = ['CBA-04 Ondina Sur', 'CBA-05 Las Malvinas', 'CBA-08 Bella Vista']
const CELULAS = ['Manzana A', 'Manzana B', 'Manzana C', 'Manzana F']

const inputCls =
  'h-11 w-full rounded-lg bg-slate-50 px-3 text-sm text-clb-ink outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-clb-primary'
const labelCls = 'text-xs font-semibold text-clb-primary'

const esHoy = (iso) => new Date(iso).toDateString() === new Date().toDateString()

/** Inscripción de Electores (ref: stitch-reference/14-inscripcion.html). */
export default function Inscripcion() {
  const toast = useToast()
  const { session, electores } = useAppState()
  const { verificarCedula, addElector } = useApp().actions

  const inscritosHoy = electores.filter(
    (e) => esHoy(e.createdAt) && (e.registradoPor === session?.username || e.registradoPor === 'demo'),
  )
  const pctMeta = Math.round((inscritosHoy.length / META_SEMANAL) * 100)
  const faltanBono = Math.max(0, META_SEMANAL - inscritosHoy.length)

  const [cedula, setCedula] = useState('')
  const [habilitado, setHabilitado] = useState(null) // datos JCE
  const [escaneando, setEscaneando] = useState(false)
  const [telefono, setTelefono] = useState('')
  const [whatsapp, setWhatsapp] = useState(true)
  const [telefonoAlt, setTelefonoAlt] = useState('')
  const [sector, setSector] = useState('')
  const [calle, setCalle] = useState('')
  const [referencia, setReferencia] = useState('')
  const [estado, setEstado] = useState('fidelizado')
  const [cba, setCba] = useState(CBAS[0])
  const [celula, setCelula] = useState(CELULAS[0])
  const [movilizacion, setMovilizacion] = useState(false)
  const [recientes, setRecientes] = useState(() =>
    [...electores].filter((e) => esHoy(e.createdAt)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  )

  function onVerificar(e) {
    e.preventDefault()
    if (!cedula) return
    const res = verificarCedula(cedula)
    if (!res.habilitado) {
      toast.show('Cédula no aparece en el padrón JCE')
      return
    }
    setHabilitado(res.datos)
  }

  function onEscanear() {
    setEscaneando(true)
    // OCR simulado: genera una cédula que no existe en el padrón local.
    const sufijo = String(100000 + electores.length + 1)
    const digits = `40299${sufijo}`
    const generada = maskCedula(digits)
    window.setTimeout(() => {
      setEscaneando(false)
      setCedula(generada)
      const res = verificarCedula(generada)
      setHabilitado(res.datos)
    }, 600)
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!habilitado) {
      toast.show('Verifica la cédula con la JCE primero')
      return
    }
    addElector({
      cedula,
      nombres: habilitado.nombres,
      apellidos: habilitado.apellidos,
      edad: habilitado.edad,
      recinto: habilitado.recinto,
      mesa: habilitado.mesa,
      orden: habilitado.orden,
      telefono,
      whatsapp,
      telefonoAlt,
      sector,
      direccion: calle ? `${calle}${referencia ? ` (ref: ${referencia})` : ''}` : '',
      nota: referencia,
      estado,
      cba,
      celula,
      movilizacionDiaD: movilizacion,
    })
    setRecientes((r) => [{ cedula, nombres: habilitado.nombres, apellidos: habilitado.apellidos, telefono, createdAt: new Date().toISOString() }, ...r])
    toast.show('¡Elector inscrito exitosamente!', 'green')
    // Reset del formulario para la siguiente inscripción
    setCedula('')
    setHabilitado(null)
    setTelefono('')
    setWhatsapp(true)
    setTelefonoAlt('')
    setSector('')
    setCalle('')
    setReferencia('')
    setEstado('fidelizado')
    setCba(CBAS[0])
    setCelula(CELULAS[0])
    setMovilizacion(false)
  }

  return (
    <div data-testid="page-inscripcion" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Título */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-4 rounded-full bg-clb-primary" />
            <div className="h-1.5 w-4 rounded-full bg-clb-orange" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Hato Mayor del Rey • Circ. 01</span>
          </div>
          <h1 className="font-display mt-0.5 text-base font-bold tracking-tight text-clb-primary">Inscripción Electoral</h1>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-bold text-clb-primary">
          <span className="material-symbols-outlined text-[14px] text-clb-orange">military_tech</span>
          Líder Destacado
        </span>
      </section>

      {/* Meta semanal */}
      <section className="rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Inscritos por Mí</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold leading-none text-clb-primary">{inscritosHoy.length}</span>
              <span className="text-sm font-semibold text-slate-500">/ {META_SEMANAL} electores</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="rounded-full bg-clb-orangeLight px-2 py-1 text-[10px] font-bold text-[#7a3000]">{pctMeta}% completado</span>
            <span className="mt-1 text-[11px] text-slate-600">Faltan {faltanBono} para bono</span>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={pctMeta} tone="blue" height="h-2.5" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clb-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-clb-primary" />
            </span>
            <span className="text-[11px] font-semibold text-clb-ink">Padrón JCE 2024 Conectado</span>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Auto-Sync Offline Activo</span>
        </div>
      </section>

      {/* Captura */}
      <section className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onEscanear}
          disabled={escaneando}
          className="flex w-full items-center justify-between rounded-xl bg-clb-primary p-3.5 text-left text-white shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.99] disabled:pointer-events-none disabled:opacity-80"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <span className={`material-symbols-outlined text-[26px] ${escaneando ? 'animate-pulse' : ''}`}>
                {escaneando ? 'progress_activity' : 'document_scanner'}
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="font-display text-sm font-bold leading-tight">{escaneando ? 'Escaneando cédula...' : 'Escanear Cédula con Cámara'}</span>
              <span className="text-[10px] text-blue-100">Autocompletar datos biométricos en 2 seg</span>
            </div>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </div>
        </button>
      </section>

      {/* Formulario */}
      <form className="flex flex-col gap-3.5" onSubmit={onSubmit}>
        {/* Paso 1 */}
        <section className="rounded-xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clb-primary text-[10px] font-bold text-white">1</span>
            <h3 className="font-display text-sm font-bold text-clb-primary">Identificación Oficial JCE</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="cedulaInput" className={labelCls}>
                Cédula de identidad
              </label>
              <input
                id="cedulaInput"
                type="tel"
                inputMode="numeric"
                placeholder="000-0000000-0"
                value={cedula}
                onChange={(e) => setCedula(maskCedula(e.target.value))}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={onVerificar}
              className="flex h-11 items-center gap-1.5 rounded-lg bg-clb-blueLight px-3.5 text-sm font-bold text-clb-primary transition-colors hover:bg-clb-primary hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Verificar
            </button>
          </div>

          {habilitado ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">Elector Habilitado JCE</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Válido
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-900">
                {habilitado.nombres} {habilitado.apellidos} • {habilitado.edad} años
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="rounded bg-white p-2">
                  <span className="block font-bold text-slate-500">Recinto</span>
                  <span className="block truncate font-semibold text-clb-ink">{habilitado.recinto}</span>
                </div>
                <div className="rounded bg-white p-2">
                  <span className="block font-bold text-slate-500">Mesa</span>
                  <span className="block font-semibold text-clb-ink">{habilitado.mesa}</span>
                </div>
                <div className="rounded bg-white p-2">
                  <span className="block font-bold text-slate-500">Orden</span>
                  <span className="block font-semibold text-clb-ink">{habilitado.orden}</span>
                </div>
                <div className="rounded bg-white p-2">
                  <span className="block font-bold text-slate-500">Circ.</span>
                  <span className="block font-semibold text-clb-ink">{habilitado.circunscripcion}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-slate-500">Escribe la cédula y presiona Verificar, o escanea con la cámara.</p>
          )}
        </section>

        {/* Paso 2 */}
        <section className="rounded-xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clb-primary text-[10px] font-bold text-white">2</span>
            <h3 className="font-display text-sm font-bold text-clb-primary">Contacto y Ubicación</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="telInput" className={labelCls}>
                  Teléfono
                </label>
                <input id="telInput" type="tel" placeholder="829-000-0000" value={telefono} onChange={(e) => setTelefono(maskTelefono(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="telAltInput" className={labelCls}>
                  Teléfono alterno
                </label>
                <input id="telAltInput" type="tel" placeholder="Opcional" value={telefonoAlt} onChange={(e) => setTelefonoAlt(maskTelefono(e.target.value))} className={inputCls} />
              </div>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
                className="h-4 w-4 rounded accent-clb-primary"
              />
              <span className="text-xs font-semibold text-clb-ink">Tiene WhatsApp</span>
            </label>
            <div className="flex flex-col gap-1">
              <label htmlFor="sectorInput" className={labelCls}>
                Sector
              </label>
              <input id="sectorInput" placeholder="Ej. Barrio Ondina" value={sector} onChange={(e) => setSector(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="calleInput" className={labelCls}>
                  Calle
                </label>
                <input id="calleInput" placeholder="Ej. Duarte #42" value={calle} onChange={(e) => setCalle(e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="refInput" className={labelCls}>
                  Referencia
                </label>
                <input id="refInput" placeholder="Casa amarilla..." value={referencia} onChange={(e) => setReferencia(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </section>

        {/* Paso 3 */}
        <section className="rounded-xl bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clb-primary text-[10px] font-bold text-white">3</span>
            <h3 className="font-display text-sm font-bold text-clb-primary">Fidelización y Estructura</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <span className={labelCls}>Fidelización</span>
              <div className="mt-1.5 flex gap-1.5">
                {OPCIONES_FIDELIZACION.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    aria-pressed={estado === op.id}
                    onClick={() => setEstado(op.id)}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition-all ${
                      estado === op.id ? 'bg-clb-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="cbaSelect" className={labelCls}>
                  CBA
                </label>
                <select id="cbaSelect" value={cba} onChange={(e) => setCba(e.target.value)} className={inputCls}>
                  {CBAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="celulaSelect" className={labelCls}>
                  Célula
                </label>
                <select id="celulaSelect" value={celula} onChange={(e) => setCelula(e.target.value)} className={inputCls}>
                  {CELULAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex w-fit cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={movilizacion}
                onChange={(e) => setMovilizacion(e.target.checked)}
                className="h-4 w-4 rounded accent-clb-orange"
              />
              <span className="text-xs font-semibold text-clb-ink">Mobilización Día D dispensado</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-clb-orange font-display text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99]"
        >
          <span>Registrar e Inscribir Elector</span>
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
        </button>
      </form>

      {/* Inscritos recientemente */}
      <section className="flex flex-col gap-2.5 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-clb-primary">Inscritos Recientemente Hoy</span>
          <span className="text-[10px] font-semibold text-slate-600">{recientes.length} registros</span>
        </div>
        {recientes.slice(0, 8).map((e) => (
          <article key={e.cedula} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card">
            <Avatar text={iniciales(e.nombres, e.apellidos)} size={36} tone="light" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-bold text-clb-ink">
                {e.nombres} {e.apellidos}
              </span>
              <span className="text-[11px] text-slate-600">{maskCedula(e.cedula)}</span>
            </div>
            <ContactActions tel={e.telefono || '809-000-0000'} waText={`Hola ${e.nombres}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló.`} />
          </article>
        ))}
      </section>
    </div>
  )
}
