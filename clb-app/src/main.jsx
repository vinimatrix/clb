import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from './registerSW.jsx'

const root = createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar service worker solo en producción (no en desarrollo con Vite HMR)
if (import.meta.env.PROD) {
  registerSW()
}
