import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import DashboardPage from '../pages/client/DashboardPage'
import ReservationsPage from '../pages/client/ReservationsPage'
import FavoritesPage from '../pages/client/FavoritesPage'
import BookingPage from '../pages/client/BookingPage'
import BusinessDetailPage from '../pages/client/BusinessDetailPage'
import AppointmentDetailPage from '../pages/client/AppointmentDetailPage'
import BusinessDashboardPage from '../pages/business/BusinessDashboardPage'
import BusinessReservationsPage from '../pages/business/BusinessReservationsPage'
import BusinessSetupPage from '../pages/business/BusinessSetupPage'
import BusinessServicesPage from '../pages/business/BusinessServicesPage'
import BusinessSchedulePage from '../pages/business/BusinessSchedulePage'
import EditBusinessPage from '../pages/business/EditBusinessPage'
import ManualAppointmentPage from '../pages/business/ManualAppointmentPage'
import BusinessQRPage from '../pages/business/BusinessQRPage'
import QRScannerPage from '../pages/business/QRScannerPage'
import CompetitorsMapPage from '../pages/business/CompetitorsMapPage'
import ProfilePage from '../pages/client/ProfilePage'
import MapPage from '../pages/client/MapPage'
import SettingsPage from '../pages/shared/SettingsPage'
import HelpCenterPage from '../pages/shared/HelpCenterPage'
import PrivacyPolicyPage from '../pages/shared/PrivacyPolicyPage'
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
      { path: '/reservations',                element: <ReservationsPage /> },
      { path: '/reservations/:reservationId', element: <AppointmentDetailPage /> },
      { path: '/favorites',          element: <FavoritesPage /> },
      { path: '/map',                  element: <MapPage /> },
      { path: '/profile',              element: <ProfilePage /> },
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
      { path: '/business/schedule',              element: <BusinessSchedulePage />    },
      { path: '/business/edit',                 element: <EditBusinessPage />         },
      { path: '/business/appointments/manual',  element: <ManualAppointmentPage />    },
      { path: '/business/qr',                   element: <BusinessQRPage />           },
      { path: '/business/scanner',              element: <QRScannerPage />            },
      { path: '/business/competitors',           element: <CompetitorsMapPage />        },
    ],
  },

  // ── Compartidas (cualquier usuario autenticado) ─────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/business/:businessId', element: <BusinessDetailPage /> },
      { path: '/booking/:businessId',  element: <BookingPage /> },
      { path: '/settings',       element: <SettingsPage /> },
      { path: '/help',           element: <HelpCenterPage /> },
      { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
    ],
  },

  // ── Fallback ────────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
