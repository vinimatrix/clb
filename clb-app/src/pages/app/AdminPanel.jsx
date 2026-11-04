import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const MODULOS = [
  { id: 'inscripcion', label: 'Inscripción', descripcion: 'Registro de electores y verificación JCE' },
  { id: 'miRecinto', label: 'Mi Recinto', descripcion: 'Gestión de recinto, padrón e incidencias' },
  { id: 'miCarpeta', label: 'Mi Carpeta', descripcion: 'Tareas de llamada y visita, fidelización' },
  { id: 'cba', label: 'CBA', descripcion: 'Comités de Base Afectivos' },
  { id: 'cbe', label: 'CBE', descripcion: 'Comités de Base Electorales' },
]

const ROLES = [
  { id: 'coordinador', label: 'Coordinador' },
  { id: 'dirigente', label: 'Dirigente' },
]

/** Panel de Administración - Solo Coordinador (Task 5). */
export default function AdminPanel() {
  const navigate = useNavigate()
  const toast = useToast()
  const { roles, permisos } = useAppState()
  const { actualizarPermiso } = useApp().actions

  const [rolActivo, setRolActivo] = useState('coordinador')

  function handleToggle(rol, modulo, checked) {
    actualizarPermiso(rol, modulo, checked)
    const rolLabel = ROLES.find((r) => r.id === rol)?.label ?? rol
    const modLabel = MODULOS.find((m) => m.id === modulo)?.label ?? modulo
    toast.show(`${rolLabel} → ${modLabel}: ${checked ? 'Habilitado' : 'Deshabilitado'}`, 'green')
  }

  return (
    <div data-testid="page-admin" className="flex flex-col gap-4 px-4 pb-2 pt-3">
      <section className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Volver a Más"
          onClick={() => navigate('/app/mas')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-clb-primary transition-colors hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-clb-primary">Panel de Administración</h1>
      </section>

      <p className="text-xs text-slate-600">
        Configura qué módulos puede ver cada rol. Los cambios se guardan automáticamente.
      </p>

      {/* Selector de rol */}
      <div className="flex gap-2" role="tablist" aria-label="Seleccionar rol para editar permisos">
        {ROLES.map((rol) => (
          <button
            key={rol.id}
            type="button"
            role="tab"
            aria-selected={rolActivo === rol.id}
            onClick={() => setRolActivo(rol.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              rolActivo === rol.id
                ? 'bg-clb-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {rol.label}
          </button>
        ))}
      </div>

      {/* Matriz de permisos */}
      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-bold text-slate-600" scope="col">Módulo</th>
                <th className="text-center py-2 px-3 font-bold text-slate-600" scope="col">Coordinador</th>
                <th className="text-center py-2 px-3 font-bold text-slate-600" scope="col">Dirigente</th>
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((modulo) => (
                <tr key={modulo.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-clb-ink">{modulo.label}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{modulo.descripcion}</p>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <label className="inline-flex items-center justify-center">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={`Coordinador ${MODULOS.find((m) => m.id === modulo.id)?.label ?? modulo.id}`}
                        checked={permisos.coordinador?.[modulo.id] ?? false}
                        onChange={(e) => handleToggle('coordinador', modulo.id, e.target.checked)}
                        className="sr-only"
                      />
                      <span className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-slate-300 bg-slate-200 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:border-clb-primary peer-checked:bg-clb-primary peer-checked:after:translate-x-full">
                      </span>
                    </label>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <label className="inline-flex items-center justify-center">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={`Dirigente ${MODULOS.find((m) => m.id === modulo.id)?.label ?? modulo.id}`}
                        checked={permisos.dirigente?.[modulo.id] ?? false}
                        onChange={(e) => handleToggle('dirigente', modulo.id, e.target.checked)}
                        className="sr-only"
                      />
                      <span className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-slate-300 bg-slate-200 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:border-clb-primary peer-checked:bg-clb-primary peer-checked:after:translate-x-full">
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/app/mas')}
          className="flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 py-2 transition-colors hover:bg-slate-200"
        >
          Volver a Más
        </button>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="flex-1 rounded-lg bg-clb-primary text-sm font-bold text-white py-2 shadow-md transition-all hover:bg-clb-primaryDeep"
        >
          Volver a Inicio
        </button>
      </div>
    </div>
  )
}