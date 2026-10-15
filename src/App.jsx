import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Carrito from './pages/Carrito.jsx'
import Login from './pages/Login.jsx'
import CrearUsuario from './pages/CrearUsuario.jsx'
import Arriendo from './pages/Arriendo.jsx'
import Reparacion from './pages/Reparacion.jsx'
import Historial from './pages/Historial.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventario from './pages/Inventario.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Proveedores from './pages/Proveedores.jsx'
import Ventas from './pages/Ventas.jsx'
import Reportes from './pages/Reportes.jsx'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/crear-usuario" element={<CrearUsuario />} />

          {/* Requieren sesión iniciada */}
          <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
          <Route path="/arriendo" element={<ProtectedRoute><Arriendo /></ProtectedRoute>} />
          <Route path="/reparacion" element={<ProtectedRoute><Reparacion /></ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />

          {/* Solo administrador */}
          <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute adminOnly><Inventario /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
          <Route path="/proveedores" element={<ProtectedRoute adminOnly><Proveedores /></ProtectedRoute>} />
          <Route path="/ventas" element={<ProtectedRoute adminOnly><Ventas /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute adminOnly><Reportes /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
