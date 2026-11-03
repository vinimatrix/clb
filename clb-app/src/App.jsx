import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Rutas from './routes.jsx'
import { AppProvider } from './store/AppContext.jsx'
import { ToastProvider } from './components/Toast.jsx'

/** App real (browser history). */
export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Rutas />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}

/** App en memoria (para pruebas). */
export function AppRouter({ initialEntries = ['/'] }) {
  return (
    <AppProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Rutas />
        </MemoryRouter>
      </ToastProvider>
    </AppProvider>
  )
}
