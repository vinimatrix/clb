import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useApp } from '../../store/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'

const ROLES = [
  { id: 'coordinador', label: 'Coordinador' },
  { id: 'dirigente', label: 'Dirigente' },
  { id: 'admin', label: 'Admin' },
]

/** Gestión de usuarios del sistema - Solo Admin */
export default function AdminUsers() {
  const navigate = useNavigate()
  const toast = useToast()
  const { users } = useAppState((s) => s.users)
  const { registrarCuenta } = useApp().actions

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    cedula: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    role: 'coordinador',
  })

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (!form.cedula || !form.username || !form.password || !form.nombres || !form.apellidos) {
      toast.show('Todos los campos son obligatorios', 'red')
      return
    }

    if (editingId) {
      toast.show('Usuario actualizado', 'green')
    } else {
      const result = registrarCuenta({
        cedula: form.cedula,
        username: form.username,
        password: form.password,
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        role: form.role,
      })
      if (result.ok) {
        toast.show('Usuario creado exitosamente', 'green')
      } else {
        toast.show(result.error || 'Error al crear usuario', 'red')
        return
      }
    }

    setForm({
      cedula: '',
      username: '',
      password: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      role: 'coordinador',
    })
    setEditingId(null)
  }

  const handleEdit = (user) => {
    setEditingId(user.id)
    setForm({
      cedula: user.cedula,
      username: user.username,
      password: '',
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono ?? '',
      role: user.role,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({
      cedula: '',
      username: '',
      password: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      role: 'coordinador',
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      toast.show('Usuario eliminado', 'green')
    }
  }

  const isEditing = editingId !== null

  return (
    <div data-testid="page-admin-usuarios" className="flex flex-col gap-4 px-4 pb-2 pt-3">
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
          {isEditing ? 'Editar Usuario' : 'Gestión de Usuarios'}
        </h1>
      </section>

      {/* Formulario de usuario */}
      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Cédula</label>
            <input
              type="text"
              value={form.cedula}
              onChange={(e) => handleInputChange('cedula', e.target.value)}
              placeholder="402-1234567-8"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="clbarcelo2026"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={isEditing ? 'dejar vacío para no cambiar' : 'mínimo 8 caracteres'}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Nombres</label>
            <input
              type="text"
              value={form.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
              placeholder="Juan"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Apellidos</label>
            <input
              type="text"
              value={form.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              placeholder="Pérez"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Teléfono</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="829-123-4567"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Rol</label>
            <select
              value={form.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-clb-primary/50 outline-none bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-clb-primary text-sm font-bold text-white py-2.5 shadow-md transition-all hover:bg-clb-primaryDeep active:scale-[0.98]"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 py-2.5 transition-colors hover:bg-slate-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="rounded-xl bg-white overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Cédula</th>
              <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Usuario</th>
              <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Nombre</th>
              <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs">Teléfono</th>
              <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs">Rol</th>
              <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                <td className="py-3 px-4 text-sm text-clb-ink">{user.cedula}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{user.username}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{user.nombres} {user.apellidos}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{user.telefono ?? '—'}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? 'bg-clb-primary/10 text-clb-primary border border-clb-primary/20'
                        : user.role === 'dirigente'
                        ? 'bg-clb-orange/10 text-clb-orange border border-clb-orange/20'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(user)}
                    className="text-clb-primary text-xs font-medium hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="text-slate-500 text-xs font-medium hover:text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm">
            No hay usuarios registrados.
          </div>
        )}
      </div>
    </div>
  )
}
