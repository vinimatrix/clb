import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../store/AppContext.jsx'

const TIPOS = [
  { id: 'CBA', label: 'CBA - Comités de Base Afectivos' },
  { id: 'CBE', label: 'CBE - Comités de Base Electorales' },
]

/** Gestión de comités - Solo Admin */
export default function AdminComites() {
  const navigate = useNavigate()
  const { comites } = useAppState((s) => s.comites)

  const [filterTipo, setFilterTipo] = useState('todos')

  const filtered = comites.filter((c) => {
    const matchesTipo =
      filterTipo === 'todos' || c.tipo === filterTipo
    return matchesTipo
  })

  return (
    <div data-testid="page-admin-comites" className="flex flex-col gap-4 px-4 pb-2 pt-3">
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
          Gestión de Comités
        </h1>
      </section>

      {/* Filtros y acción */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 md:flex-1">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-3 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none bg-white"
          >
            <option value="todos">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/cba')}
          className="md:w-auto rounded-lg bg-clb-primary text-sm font-bold text-white py-2.5 shadow-md transition-all hover:bg-clb-primaryDeep"
        >
          + Nuevo Comité
        </button>
      </div>

      {/* Resumen */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Comités</div>
          <div className="text-2xl font-bold text-clb-ink">{comites.length}</div>
        </div>
        <div className="flex-1 rounded-lg bg-clb-blueLight/50 p-4">
          <div className="text-xs font-bold text-clb-primary uppercase tracking-wider">CBA</div>
          <div className="text-2xl font-bold text-clb-primary">
            {comites.filter((c) => c.tipo === 'CBA').length}
          </div>
        </div>
        <div className="flex-1 rounded-lg bg-clb-orangeLight/50 p-4">
          <div className="text-xs font-bold text-clb-orange uppercase tracking-wider">CBE</div>
          <div className="text-2xl font-bold text-clb-orange">
            {comites.filter((c) => c.tipo === 'CBE').length}
          </div>
        </div>
      </div>

      {/* Tabla de comités */}
      <div className="rounded-xl bg-white overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Código</th>
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Nombre</th>
                <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Tipo</th>
                <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Líder</th>
                <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Integrantes</th>
                <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Estado</th>
                <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                  <td className="py-3 px-4 text-sm text-clb-ink font-mono">{c.codigo}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.nombre}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        c.tipo === 'CBA'
                          ? 'bg-clb-blueLight/50 text-clb-primary border border-clb-primary/20'
                          : 'bg-clb-orangeLight/50 text-clb-orange border border-clb-orange/20'
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.lider}</td>
                  <td className="py-3 px-4 text-sm text-center text-slate-600">
                    {c.integrantes}
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        c.estado === 'blindado'
                          ? 'bg-clb-primary/10 text-clb-primary border border-clb-primary/20'
                          : c.estado === 'proceso'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-clb-orange/10 text-clb-orange border border-clb-orange/20'
                      }`}
                    >
                      {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/${c.tipo === 'CBA' ? 'cba' : 'cbe'}`)}
                      className="text-clb-primary text-xs font-medium hover:underline mr-3"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm">
            No se encontraron comités con esos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
