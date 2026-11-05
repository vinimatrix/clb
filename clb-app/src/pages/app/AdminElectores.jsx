import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../store/AppContext.jsx'

/** Gestión de electores - Solo Admin */
export default function AdminElectores() {
  const navigate = useNavigate()
  const { electores } = useAppState((s) => s.electores)

  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')

  const filtered = electores.filter((e) => {
    const matchesSearch =
      !search ||
      e.nombres.toLowerCase().includes(search.toLowerCase()) ||
      e.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      e.cedula.includes(search)
    const matchesEstado =
      filterEstado === 'todos' || e.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const estados = ['todos', 'indeciso', 'fidelizado', 'contactado', 'no_contactado']

  return (
    <div data-testid="page-admin-electores" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver al panel"
          onClick={() => navigate('/app/admin')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">
          Gestión de Electores
        </h1>
      </section>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 md:flex-2 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -mt-2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o cédula..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
          />
        </div>
        <div className="flex-1 md:flex-1">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-3 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none bg-white"
          >
            {estados.map((est) => (
              <option key={est} value={est}>
                {est.charAt(0).toUpperCase() + est.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/inscripcion')}
          className="md:w-auto rounded-lg bg-clb-primary text-sm font-bold text-white py-2.5 shadow-md transition-all hover:bg-clb-primaryDeep"
        >
          + Registrar Elector
        </button>
      </div>

      {/* Resumen */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Electores</div>
          <div className="text-2xl font-bold text-clb-ink">{electores.length}</div>
        </div>
        <div className="flex-1 rounded-lg bg-clb-primary/10 p-4">
          <div className="text-xs font-bold text-clb-primary uppercase tracking-wider">Fidelizados</div>
          <div className="text-2xl font-bold text-clb-primary">
            {electores.filter((e) => e.estado === 'fidelizado').length}
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-clb-orange/10 p-4">
          <div className="text-xs font-bold text-clb-orange uppercase tracking-wider">Indecisos</div>
          <div className="text-2xl font-bold text-clb-orange">
            {electores.filter((e) => e.estado === 'indeciso').length}
          </div>
        </div>
      </div>

      {/* Tabla de electores */}
      <div className="rounded-xl bg-white overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Cédula</th>
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Nombre</th>
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Recinto</th>
                <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Mesa</th>
                <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Estado</th>
                <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                  <td className="py-3 px-4 text-sm text-clb-ink">{e.cedula}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{e.nombres} {e.apellidos}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{e.recinto ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-center">{e.mesa ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        e.estado === 'fidelizado'
                          ? 'bg-clb-primary/10 text-clb-primary border border-clb-primary/20'
                          : e.estado === 'indeciso'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-clb-orange/10 text-clb-orange border border-clb-orange/20'
                      }`}
                    >
                      {e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/inscripcion?cedula=${e.cedula}`)}
                      className="text-clb-primary text-xs font-medium hover:underline mr-3"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm">
            No se encontraron electores con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
