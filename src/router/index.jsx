import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import DashboardPage from '../pages/client/DashboardPage'
import ReservationsPage from '../pages/client/ReservationsPage'
import FavoritesPage from '../pages/client/FavoritesPage'
import BusinessDashboardPage from '../pages/business/BusinessDashboardPage'
import BusinessReservationsPage from '../pages/business/BusinessReservationsPage'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'

const router = createBrowserRouter([
  // ── Auth (solo accesibles sin sesión) ───────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      { path: '/login',        element: <LoginPage /> },
      { path: '/signup',       element: <Navigate to="/signup/client" replace /> },
      { path: '/signup/:type', element: <SignupPage /> },
    ],
  },

  // ── Cliente ─────────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="CLIENT" />,
    children: [
      { path: '/dashboard',    element: <DashboardPage /> },
      { path: '/reservations', element: <ReservationsPage /> },
      { path: '/favorites',    element: <FavoritesPage /> },
    ],
  },

  // ── Negocio ─────────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="BUSINESS_OWNER" />,
    children: [
      { path: '/business/dashboard',    element: <BusinessDashboardPage /> },
      { path: '/business/reservations', element: <BusinessReservationsPage /> },
    ],
  },

  // ── Fallback ────────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
