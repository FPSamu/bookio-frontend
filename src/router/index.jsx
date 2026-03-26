import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import DashboardPage from '../pages/client/DashboardPage'
import ReservationsPage from '../pages/client/ReservationsPage'
import FavoritesPage from '../pages/client/FavoritesPage'

const router = createBrowserRouter([
  // ── Auth ────────────────────────────────────────────────────────────────────
  { path: '/login',        element: <LoginPage /> },
  { path: '/signup',       element: <Navigate to="/signup/client" replace /> },
  { path: '/signup/:type', element: <SignupPage /> },

  // ── Cliente ─────────────────────────────────────────────────────────────────
  { path: '/dashboard',    element: <DashboardPage /> },
  { path: '/reservations', element: <ReservationsPage /> },
  { path: '/favorites',    element: <FavoritesPage /> },

  // ── Fallback ────────────────────────────────────────────────────────────────
  { path: '*',             element: <Navigate to="/dashboard" replace /> },
])

export default router
