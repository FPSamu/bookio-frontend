import { useState, useEffect } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import ReservationList from '../../components/reservations/ReservationList'
import ReservationTabFilter from '../../components/reservations/ReservationTabFilter'
import SectionTitle from '../../components/ui/SectionTitle'
import { useAuth } from '../../context/AuthContext'
import { getAppointments, cancelAppointment } from '../../services/appointments'

export default function ReservationsPage() {
  const { user } = useAuth()
  const [activeTab,     setActiveTab]     = useState('upcoming')
  const [reservations,  setReservations]  = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    async function fetchReservations() {
      setLoading(true)
      try {
        const data = await getAppointments({ status: activeTab, clientId: user.id })
        if (!cancelled) setReservations(data)
      } catch (err) {
        console.error('Error cargando reservas:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReservations()
    return () => { cancelled = true }
  }, [activeTab, user?.id])

  const handleCancel = async (reservation) => {
    try {
      await cancelAppointment(reservation.id)
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id))
    } catch (err) {
      console.error('Error cancelando reserva:', err)
    }
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
          subtitle={`${reservations.length} reserva${reservations.length !== 1 ? 's' : ''}`}
          className="mb-4"
        />
        <ReservationList
          reservations={reservations}
          loading={loading}
          activeTab={activeTab}
          onCancel={handleCancel}
        />
      </section>

    </ClientLayout>
  )
}
