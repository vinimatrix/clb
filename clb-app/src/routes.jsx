import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppState } from './store/AppContext.jsx'
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
import CallCenter from './pages/app/CallCenter.jsx'
import Placeholder from './pages/Placeholder.jsx'

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
        <Route path="/app/fidelizados" element={<Fidelizados />} />
        <Route path="/app/cba" element={<Cba />} />
        <Route path="/app/cbe" element={<Cbe />} />
        <Route path="/app/callcenter" element={<CallCenter />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/recinto" element={<MiRecinto />} />
        <Route path="/app/padron" element={<Padron />} />
        <Route path="/app/inscripcion" element={<Inscripcion />} />
        <Route path="/app/carpeta" element={<MiCarpeta />} />
        <Route path="/app/perfil" element={<Perfil />} />
        <Route path="/app/mas" element={<Mas />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default Rutas
