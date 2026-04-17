import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirects authenticated users away from login/signup
export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-neutral-400">Cargando...</span>
      </div>
    )
  }

  if (user) {
    return <Navigate to={user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard'} replace />
  }

  return <Outlet />
}
