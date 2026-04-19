import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import DashboardPage from '../pages/client/DashboardPage'
import ReservationsPage from '../pages/client/ReservationsPage'
import FavoritesPage from '../pages/client/FavoritesPage'
import BookingPage from '../pages/client/BookingPage'
import BusinessDashboardPage from '../pages/business/BusinessDashboardPage'
import BusinessReservationsPage from '../pages/business/BusinessReservationsPage'
import BusinessSetupPage from '../pages/business/BusinessSetupPage'
import BusinessServicesPage from '../pages/business/BusinessServicesPage'
import BusinessSchedulePage from '../pages/business/BusinessSchedulePage'
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
      { path: '/dashboard',          element: <DashboardPage /> },
      { path: '/reservations',       element: <ReservationsPage /> },
      { path: '/favorites',          element: <FavoritesPage /> },
      { path: '/booking/:businessId',element: <BookingPage /> },
    ],
  },

  // ── Negocio ─────────────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute requiredRole="BUSINESS_OWNER" />,
    children: [
      { path: '/business/setup',        element: <BusinessSetupPage /> },
      { path: '/business/dashboard',    element: <BusinessDashboardPage /> },
      { path: '/business/reservations', element: <BusinessReservationsPage /> },
      { path: '/business/services',     element: <BusinessServicesPage /> },
      { path: '/business/schedule',     element: <BusinessSchedulePage /> },
    ],
  },

  // ── Fallback ────────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
