import { useState, useMemo } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import ReservationList from '../../components/reservations/ReservationList'
import ReservationTabFilter from '../../components/reservations/ReservationTabFilter'
import SectionTitle from '../../components/ui/SectionTitle'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamada a la API (GET /reservations?status=upcoming|past|cancelled)

const MOCK_RESERVATIONS = [
  // ── Próximas ──────────────────────────────────────────────────────────────
  {
    id: '1', businessType: 'restaurant',
    businessName: 'Sushi Nami', businessCategory: 'Japonesa',
    serviceName: 'Menú omakase para 2',
    date: '2026-04-05T19:00:00', time: '19:00',
    status: 'confirmed', price: 980, duration: 90,
  },
  {
    id: '2', businessType: 'medical',
    businessName: 'DermaVida', businessCategory: 'Dermatología',
    serviceName: 'Consulta de valoración',
    date: '2026-04-10T11:00:00', time: '11:00',
    status: 'confirmed', price: 800, duration: 45,
  },
  {
    id: '3', businessType: 'spa',
    businessName: 'Zen Garden Spa', businessCategory: 'Masajes',
    serviceName: 'Masaje de relajación 60 min',
    date: '2026-04-12T14:00:00', time: '14:00',
    status: 'pending', price: 650, duration: 60,
  },

  // ── Pasadas ───────────────────────────────────────────────────────────────
  {
    id: '4', businessType: 'restaurant',
    businessName: 'Brunch & Co.', businessCategory: 'Brunch',
    serviceName: 'Mesa para 2 personas',
    date: '2026-03-15T10:30:00', time: '10:30',
    status: 'confirmed', price: 360, duration: 60,
  },
  {
    id: '5', businessType: 'salon',
    businessName: 'The Barber Society', businessCategory: 'Barba',
    serviceName: 'Corte y arreglo de barba',
    date: '2026-03-10T17:00:00', time: '17:00',
    status: 'confirmed', price: 280, duration: 45,
  },
  {
    id: '6', businessType: 'medical',
    businessName: 'Sonrisa Perfecta', businessCategory: 'Odontología',
    serviceName: 'Limpieza dental',
    date: '2026-02-20T09:00:00', time: '09:00',
    status: 'confirmed', price: 600, duration: 60,
  },

  // ── Canceladas ────────────────────────────────────────────────────────────
  {
    id: '7', businessType: 'spa',
    businessName: 'Lumière Beauty Spa', businessCategory: 'Faciales',
    serviceName: 'Facial hidratante profundo',
    date: '2026-03-01T13:00:00', time: '13:00',
    status: 'cancelled', price: 450, duration: 60,
  },
  {
    id: '8', businessType: 'restaurant',
    businessName: 'Smash House', businessCategory: 'Americana',
    serviceName: 'Mesa para 2 personas',
    date: '2026-02-14T21:00:00', time: '21:00',
    status: 'cancelled', price: 520, duration: 60,
  },
]

// Corte entre próximas y pasadas basado en la fecha actual
const NOW = new Date()

const TAB_FILTER = {
  upcoming:  (r) => r.status !== 'cancelled' && new Date(r.date) >= NOW,
  past:      (r) => r.status !== 'cancelled' && new Date(r.date) <  NOW,
  cancelled: (r) => r.status === 'cancelled',
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [loading] = useState(false) // TODO: true mientras carga la API

  const visibleReservations = useMemo(
    () => MOCK_RESERVATIONS.filter(TAB_FILTER[activeTab]),
    [activeTab]
  )

  const handleCancel = (reservation) => {
    // TODO: llamada a la API (DELETE /reservations/:id)
    console.log('Cancelar reserva:', reservation.id)
  }

  return (
    <ClientLayout>

      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">Mis Reservas</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Consulta y gestiona todas tus reservaciones.
          </p>
        </div>
        <ReservationTabFilter selected={activeTab} onChange={setActiveTab} />
      </section>

      {/* ── Lista ─────────────────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={
            activeTab === 'upcoming'  ? 'Próximas reservas'   :
            activeTab === 'past'      ? 'Reservas pasadas'    :
                                        'Reservas canceladas'
          }
          subtitle={`${visibleReservations.length} reserva${visibleReservations.length !== 1 ? 's' : ''}`}
          className="mb-4"
        />
        <ReservationList
          reservations={visibleReservations}
          loading={loading}
          activeTab={activeTab}
          onCancel={handleCancel}
        />
      </section>

    </ClientLayout>
  )
}
