import { useMemo, useState } from 'react'
import { SearchBar, FilterPills, Avatar, ContactActions, Badge } from '../../components/index.js'
import { maskCedula, iniciales } from '../../lib/format.js'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const ESTADOS = [
  { id: 'todos', label: 'Todos' },
  { id: 'fidelizado', label: 'Fidelizados' },
  { id: 'simpatizante', label: 'Simpatizantes' },
  { id: 'indeciso', label: 'Indecisos' },
]

const BADGE_ESTADO = {
  fidelizado: { label: 'Voto seguro', tone: 'green' },
  simpatizante: { label: 'Simpatizante', tone: 'orange' },
  indeciso: { label: 'Indeciso', tone: 'gray' },
}

/**
 * Padrón de Recinto (ref: stitch-reference/13-padron.html).
 * Lista solo los electores del recinto del usuario, con búsqueda
 * por nombre completo / cédula / mesa y filtro por estado.
 */
export default function Padron() {
  const toast = useToast()
  const { session, recinto, electores } = useAppState()
  const { tipificarElector } = useApp().actions
  const [query, setQuery] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const claveRecinto = recinto?.nombre ? recinto.nombre.trim().split(/\s+/).pop() : ''
  const delRecinto = useMemo(
    () => electores.filter((e) => claveRecinto && String(e.recinto ?? '').includes(claveRecinto)),
    [electores, claveRecinto],
  )

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digitos = q.replace(/\D/g, '')
    return delRecinto.filter((e) => {
      if (filtro !== 'todos' && e.estado !== filtro) return false
      if (!q) return true
      const nombreCompleto = `${e.nombres} ${e.apellidos}`.trim().toLowerCase()
      const porNombre = nombreCompleto.startsWith(q)
      const porCedula = digitos.length >= 3 && String(e.cedula ?? '').replace(/\D/g, '').includes(digitos)
      const porMesa = e.mesa && e.mesa.toLowerCase().includes(q)
      return porNombre || porCedula || porMesa
    })
  }, [delRecinto, query, filtro])

  const conteos = useMemo(() => {
    const c = { fidelizado: 0, simpatizante: 0, indeciso: 0 }
    for (const e of delRecinto) c[e.estado] = (c[e.estado] ?? 0) + 1
    return c
  }, [delRecinto])

  function fidelizar(id) {
    tipificarElector(id, { intencion: 'voto-seguro', via: 'padrón' })
    toast.show('Voto seguro confirmado', 'green')
  }

  return (
    <div data-testid="page-padron" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      {/* Título de página */}
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver a Mi Recinto"
          onClick={() => window.history.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-1">
            <div className="h-1 w-3 rounded-full bg-clb-primary" />
            <div className="h-1 w-3 rounded-full bg-clb-orange" />
          </div>
          <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">Padrón de Recinto</h1>
          <p className="truncate text-[11px] text-slate-600">{recinto?.nombre}</p>
        </div>
        <button
          type="button"
          aria-label="Exportar o Descargar Padrón"
          onClick={() => toast.show('Disponible en la versión con backend')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-clb-orangeLight text-clb-orange transition-colors hover:bg-clb-orange hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
        </button>
      </section>

      <SearchBar placeholder="Buscar por nombre o cédula..." value={query} onChange={setQuery} onClear={() => setQuery('')} />

      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-slate-600">
          Mostrando {filtrados.length} de {delRecinto.length} electores del recinto
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-clb-orange">JCE Sync</span>
      </div>

      <FilterPills
        options={ESTADOS.map((e) => ({
          id: e.id,
          label: e.label,
          count: e.id === 'todos' ? delRecinto.length : (conteos[e.id] ?? 0),
        }))}
        active={filtro}
        onChange={setFiltro}
      />

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined text-[24px]">person_search</span>
          </div>
          <p className="text-sm font-bold text-clb-ink">Sin resultados</p>
          <p className="text-xs text-slate-600">Ajusta la búsqueda o el filtro para encontrar al elector.</p>
        </div>
      ) : (
        <section className="flex flex-col gap-2.5">
          {filtrados.map((e) => {
            const badge = BADGE_ESTADO[e.estado] ?? { label: e.estado, tone: 'gray' }
            const fidelizable = e.estado && e.estado !== 'fidelizado'
            return (
              <article key={e.id} data-testid="elector-row" className="rounded-xl bg-white p-3.5 shadow-card">
                <div className="flex items-start gap-3">
                  <Avatar text={iniciales(e.nombres, e.apellidos)} size={40} tone={e.estado === 'fidelizado' ? 'blue' : 'light'} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-clb-ink">{e.nombres}</span>
                        <span className="truncate text-sm text-clb-ink">{e.apellidos}</span>
                      </div>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {maskCedula(e.cedula)} • Mesa {e.mesa} • Orden {e.orden}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  {fidelizable ? (
                    <button
                      type="button"
                      data-accion="fidelizar"
                      onClick={() => fidelizar(e.id)}
                      className="flex h-9 items-center gap-1.5 rounded-lg bg-clb-orange px-3 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-orange-500"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Fidelizar
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Ya está fidelizado
                    </span>
                  )}
                  <ContactActions tel={e.telefono} waText={`Hola ${e.nombres}, soy ${session?.nombres} del proyecto de Carmen Ligia Barceló.`} />
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
