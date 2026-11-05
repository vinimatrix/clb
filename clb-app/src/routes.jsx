import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAppState, useApp } from './store/AppContext.jsx'
import Portada from './pages/public/Portada.jsx'
import Unirme from './pages/public/Unirme.jsx'
import Confirmacion from './pages/public/Confirmacion.jsx'
import CrearUsuario from './pages/public/CrearUsuario.jsx'
import Otp from './pages/public/Otp.jsx'
import Contrasena from './pages/public/Contrasena.jsx'
import Exito from './pages/public/Exito.jsx'
import Login from './pages/public/Login.jsx'
import Validando from './pages/public/Validando.jsx'
import { AppLayout } from './components/AppLayout.jsx'
import Dashboard from './pages/app/Dashboard.jsx'
import MiRecinto from './pages/app/MiRecinto.jsx'
import Padron from './pages/app/Padron.jsx'
import Inscripcion from './pages/app/Inscripcion.jsx'
import MiCarpeta from './pages/app/MiCarpeta.jsx'
import Fidelizados from './pages/app/Fidelizados.jsx'
import Cba from './pages/app/Cba.jsx'
import Cbe from './pages/app/Cbe.jsx'
import Perfil from './pages/app/Perfil.jsx'
import Mas from './pages/app/Mas.jsx'
import AdminPanel from './pages/app/AdminPanel.jsx'
import AdminUsers from './pages/app/AdminUsers.jsx'
import AdminRoles from './pages/app/AdminRoles.jsx'
import AdminElectores from './pages/app/AdminElectores.jsx'
import AdminComites from './pages/app/AdminComites.jsx'
import AdminReportes from './pages/app/AdminReportes.jsx'
import CallCenter from './pages/app/CallCenter.jsx'

/**
 * Permite saltar el guard una vez: lo usa la salida de sesión deliberada
 * (Perfil) para que el guard rancio no reemplace la navegación a '/' por /login.
 */
let saltoGuardPendiente = false
export function saltarGuardUnaVez() {
  saltoGuardPendiente = true
}

/** Guarda: las rutas /app/* exigen sesión activa. */
function RequireAuth({ children }) {
  const { session } = useAppState()
  if (!session) {
    if (saltoGuardPendiente) {
      saltoGuardPendiente = false
      return children
    }
    return <Navigate to="/login" replace />
  }
  return children
}

/** Guarda: verifica que el usuario tenga permiso para el módulo. */
function RequirePermiso({ children, modulo }) {
  const { session } = useAppState()
  const { tienePermiso } = useApp().actions
  if (!session) return <Navigate to="/login" replace />
  // Mapear roles legados al sistema de permisos
  const role = session.role === 'Miembro' ? 'dirigente' : session.role
  if (!tienePermiso(modulo, role)) {
    return <Navigate to="/app" replace />
  }
  return children
}

/** Tabla de rutas de la app (referencia única). */
export function Rutas() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Portada />} />
      <Route path="/registro" element={<Unirme />} />
      <Route path="/registro/confirmacion" element={<Confirmacion />} />
      <Route path="/registro/usuario" element={<CrearUsuario />} />
      <Route path="/registro/otp" element={<Otp />} />
      <Route path="/registro/contrasena" element={<Contrasena />} />
      <Route path="/registro/exito" element={<Exito />} />
      <Route path="/login" element={<Login />} />
      <Route path="/validando" element={<Validando />} />
      {/* App (protegidas, con layout compartido) */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route element={<RequirePermiso modulo="inscripcion"><Inscripcion /></RequirePermiso>} path="/app/inscripcion" />
        <Route element={<RequirePermiso modulo="miRecinto"><MiRecinto /></RequirePermiso>} path="/app/recinto" />
        <Route element={<RequirePermiso modulo="miCarpeta"><MiCarpeta /></RequirePermiso>} path="/app/carpeta" />
        <Route element={<RequirePermiso modulo="cba"><Cba /></RequirePermiso>} path="/app/cba" />
        <Route element={<RequirePermiso modulo="cbe"><Cbe /></RequirePermiso>} path="/app/cbe" />
        <Route element={<RequirePermiso modulo="callcenter"><CallCenter /></RequirePermiso>} path="/app/callcenter" />
        <Route element={<RequirePermiso modulo="fidelizados"><Fidelizados /></RequirePermiso>} path="/app/fidelizados" />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/padron" element={<Padron />} />
        <Route path="/app/perfil" element={<Perfil />} />
        <Route path="/app/mas" element={<Mas />} />
        <Route element={<RequirePermiso modulo="admin"><AdminPanel /></RequirePermiso>} path="/app/admin" />
        <Route element={<RequirePermiso modulo="admin"><AdminUsers /></RequirePermiso>} path="/app/admin/usuarios" />
        <Route element={<RequirePermiso modulo="admin"><AdminRoles /></RequirePermiso>} path="/app/admin/roles" />
        <Route element={<RequirePermiso modulo="admin"><AdminElectores /></RequirePermiso>} path="/app/admin/electores" />
        <Route element={<RequirePermiso modulo="admin"><AdminComites /></RequirePermiso>} path="/app/admin/comites" />
        <Route element={<RequirePermiso modulo="admin"><AdminReportes /></RequirePermiso>} path="/app/admin/reportes" />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default Rutas
