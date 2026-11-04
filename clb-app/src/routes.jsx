import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import Placeholder from './pages/Placeholder.jsx'

/** Guarda: las rutas /app/* exigen sesión activa. */
function RequireAuth({ children }) {
  const { session } = useAppState()
  if (!session) return <Navigate to="/login" replace />
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
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/recinto" element={<MiRecinto />} />
        <Route path="/app/padron" element={<Padron />} />
        <Route path="/app/inscripcion" element={<Placeholder testId="page-inscripcion" nombre="Inscripción" />} />
        <Route path="/app/carpeta" element={<Placeholder testId="page-carpeta" nombre="Mi Carpeta" />} />
        <Route path="/app/fidelizados" element={<Placeholder testId="page-fidelizados" nombre="Fidelizados" />} />
        <Route path="/app/cba" element={<Placeholder testId="page-cba" nombre="CBA" />} />
        <Route path="/app/cbe" element={<Placeholder testId="page-cbe" nombre="CBE" />} />
        <Route path="/app/callcenter" element={<Placeholder testId="page-callcenter" nombre="Call Center" />} />
        <Route path="/app/perfil" element={<Placeholder testId="page-perfil" nombre="Perfil" />} />
        <Route path="/app/mas" element={<Placeholder testId="page-mas" nombre="Más" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default Rutas
