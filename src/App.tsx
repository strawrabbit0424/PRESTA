import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import FormularioPublico from './pages/FormularioPublico'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import QR from './pages/QR'
import Historial from './pages/Historial'
import RutaProtegida from './components/RutaProtegida'
import Notificador from './components/Notificador'

function App() {
  return (
    <HashRouter>
      <Notificador />
      <Routes>
        <Route path="/" element={<FormularioPublico />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/historial"
          element={
            <RutaProtegida>
              <Historial />
            </RutaProtegida>
          }
        />
        <Route
          path="/qr"
          element={
            <RutaProtegida>
              <QR />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App