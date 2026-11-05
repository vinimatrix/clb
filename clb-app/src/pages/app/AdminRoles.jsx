import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../store/AppContext.jsx'

const ROLES_INFO = [
  {
    id: 'coordinador',
    label: 'Coordinador',
    descripcion: 'Usuario registrado con acceso a Inscripción y administración básica',
    color: 'clb-primary',
  },
  {
    id: 'dirigente',
    label: 'Dirigente',
    descripcion: 'Líder territorial con acceso a Inscripción, Recinto, Carpeta, Fidelizados y más',
    color: 'clb-orange',
  },
  {
    id: 'admin',
    label: 'Admin',
    descripcion: 'Acceso total a todos los módulos incluyendo el Panel de Administración',
    color: 'clb-primaryDeep',
  },
]

const MODULOS = [
  { id: 'inscripcion', label: 'Inscripción' },
  { id: 'miRecinto', label: 'Mi Recinto' },
  { id: 'miCarpeta', label: 'Mi Carpeta' },
  { id: 'fidelizados', label: 'Fidelizados' },
  { id: 'cba', label: 'CBA' },
  { id: 'cbe', label: 'CBE' },
  { id: 'callcenter', label: 'Call Center' },
  { id: 'admin', label: 'Admin Panel' },
]

/** Gestión de roles y permisos - Solo Admin */
export default function AdminRoles() {
  const navigate = useNavigate()
  const { permisos } = useAppState((s) => s.permisos)

  return (
    <div data-testid="page-admin-roles" className="flex flex-col gap-4 px-4 pb-2 pt-3">
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
          Roles y Permisos
        </h1>
      </section>

      <p className="text-xs text-slate-600 mb-4">
        Configura qué módulos están disponibles para cada rol del sistema.
      </p>

      {/* Tarjetas de rol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES_INFO.map((rol) => {
          const rolPermisos = permisos[rol.id] ?? {}
          const habilitados = Object.entries(rolPermisos).filter(([, v]) => v).length
          const total = MODULOS.length
          return (
            <div
              key={rol.id}
              className={`rounded-xl p-4 shadow-card border border-slate-100 ${
                rol.color === 'clb-primaryDeep'
                  ? 'bg-clb-primaryDeep/5 border-clb-primaryDeep/20'
                  : rol.color === 'clb-orange'
                  ? 'bg-clb-orangeLight/5 border-clb-orange/20'
                  : 'bg-clb-primaryLight/5 border-clb-primary/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  rol.color === 'clb-primaryDeep'
                    ? 'bg-clb-primaryDeep text-white'
                    : rol.color === 'clb-orange'
                    ? 'bg-clb-orange text-white'
                    : 'bg-clb-primary text-white'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {rol.id === 'admin' ? 'admin_panel_settings' : rol.id === 'dirigente' ? 'person' : 'verified_user'}
                  </span>
                </div>
                <span className={`font-bold text-sm ${rol.color === 'clb-primaryDeep' ? 'text-clb-primaryDeep' : rol.color === 'clb-orange' ? 'text-clb-orange' : 'text-clb-primary'}`}>
                  {rol.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-4">{rol.descripcion}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600">Módulos habilitados</span>
                <span className="text-xs font-bold text-clb-primary">{habilitados}/{total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    rol.color === 'clb-primaryDeep'
                      ? 'bg-clb-primaryDeep'
                      : rol.color === 'clb-orange'
                      ? 'bg-clb-orange'
                      : 'bg-clb-primary'
                  }`}
                  style={{ width: `${(habilitados / total) * 100}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Matriz de permisos por rol */}
      <div className="rounded-xl bg-white overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Módulo</th>
              {ROLES_INFO.map((rol) => (
                <th
                  key={rol.id}
                  className="text-center py-3 px-4 font-bold text-slate-600 text-xs"
                >
                  {rol.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULOS.map((modulo) => (
              <tr key={modulo.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 px-4 text-sm text-clb-ink font-medium">{modulo.label}</td>
                {ROLES_INFO.map((rol) => (
                  <td key={rol.id} className="text-center py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        permisos[rol.id]?.[modulo.id]
                          ? 'bg-clb-primary text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {permisos[rol.id]?.[modulo.id] ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={() => navigate('/app/admin')}
          className="flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 py-2.5 transition-colors hover:bg-slate-200"
        >
          Volver al Panel
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/mas')}
          className="flex-1 rounded-lg bg-clb-primary text-sm font-bold text-white py-2.5 shadow-md transition-all hover:bg-clb-primaryDeep"
        >
          Volver a Más
        </button>
      </div>
    </div>
  )
}
