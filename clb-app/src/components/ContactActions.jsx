import { Icon } from './Icon.jsx'

/**
 * Acciones de contacto: llamar (tel:) y WhatsApp (wa.me con texto).
 * waText opcional; tel se normaliza quitando guiones.
 */
export function ContactActions({ tel, waText, onBitacora, onCompletar, completado = false }) {
  const telDigits = String(tel ?? '').replace(/\D/g, '')
  const waHref = waText
    ? `https://wa.me/1${telDigits}?text=${encodeURIComponent(waText)}`
    : `https://wa.me/1${telDigits}`
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`tel:${telDigits}`}
        title="Llamar"
        aria-label={`Llamar a ${tel}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-clb-primary transition-colors hover:bg-clb-primary hover:text-white"
      >
        <span className="material-symbols-outlined text-[18px]">call</span>
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        aria-label="Enviar WhatsApp"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
      >
        <span className="material-symbols-outlined text-[18px]">chat</span>
      </a>
      {onBitacora ? (
        <button
          type="button"
          onClick={onBitacora}
          className="flex h-9 items-center gap-1 rounded-lg bg-slate-100 px-2.5 text-[10px] font-semibold text-clb-muted hover:text-clb-primary"
        >
          <span className="material-symbols-outlined text-[16px]">notes</span>
          Bitácora
        </button>
      ) : null}
      {onCompletar ? (
        <button
          type="button"
          onClick={onCompletar}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-bold transition-colors ${
            completado ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-clb-muted hover:bg-emerald-100 hover:text-emerald-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{completado ? 'done_all' : 'check_circle'}</span>
          <span>{completado ? '¡Lista!' : 'Completar'}</span>
        </button>
      ) : null}
    </div>
  )
}
