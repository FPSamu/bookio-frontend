import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-neutral-400">Cargando...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'} replace />
  }

  return <Outlet />
}
