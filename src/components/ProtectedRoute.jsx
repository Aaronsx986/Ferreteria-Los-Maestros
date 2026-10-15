import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Envuelve una <Route> y filtra el acceso según sesión/rol.
// Sin sesión -> /login. Con sesión pero sin permiso de admin -> inicio.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute
