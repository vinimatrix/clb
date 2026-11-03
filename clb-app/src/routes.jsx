import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAppState } from './store/AppContext.jsx'
import Portada from './pages/public/Portada.jsx'
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
      <Route path="/registro" element={<Placeholder testId="page-registro" nombre="Registro — Paso 2" />} />
      <Route path="/registro/confirmacion" element={<Placeholder testId="page-confirmacion" nombre="Registro — Paso 3" />} />
      <Route path="/registro/usuario" element={<Placeholder testId="page-usuario" nombre="Registro — Paso 4" />} />
      <Route path="/registro/otp" element={<Placeholder testId="page-otp" nombre="Registro — Paso 5" />} />
      <Route path="/registro/contrasena" element={<Placeholder testId="page-contrasena" nombre="Registro — Paso 6" />} />
      <Route path="/registro/exito" element={<Placeholder testId="page-exito" nombre="Registro — Paso 7" />} />
      <Route path="/login" element={<Placeholder testId="page-login" nombre="Iniciar sesión — Paso 8" />} />
      <Route path="/validando" element={<Placeholder testId="page-validando" nombre="Validación de acceso — Paso 9" />} />
      {/* App (protegidas) */}
      <Route path="/app" element={<RequireAuth><Placeholder testId="page-dashboard" nombre="Dashboard" /></RequireAuth>} />
      <Route path="/app/recinto" element={<RequireAuth><Placeholder testId="page-recinto" nombre="Mi Recinto" /></RequireAuth>} />
      <Route path="/app/padron" element={<RequireAuth><Placeholder testId="page-padron" nombre="Padrón de Recinto" /></RequireAuth>} />
      <Route path="/app/inscripcion" element={<RequireAuth><Placeholder testId="page-inscripcion" nombre="Inscripción" /></RequireAuth>} />
      <Route path="/app/carpeta" element={<RequireAuth><Placeholder testId="page-carpeta" nombre="Mi Carpeta" /></RequireAuth>} />
      <Route path="/app/fidelizados" element={<RequireAuth><Placeholder testId="page-fidelizados" nombre="Fidelizados" /></RequireAuth>} />
      <Route path="/app/cba" element={<RequireAuth><Placeholder testId="page-cba" nombre="CBA" /></RequireAuth>} />
      <Route path="/app/cbe" element={<RequireAuth><Placeholder testId="page-cbe" nombre="CBE" /></RequireAuth>} />
      <Route path="/app/callcenter" element={<RequireAuth><Placeholder testId="page-callcenter" nombre="Call Center" /></RequireAuth>} />
      <Route path="/app/perfil" element={<RequireAuth><Placeholder testId="page-perfil" nombre="Perfil" /></RequireAuth>} />
      <Route path="/app/mas" element={<RequireAuth><Placeholder testId="page-mas" nombre="Más" /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default Rutas
