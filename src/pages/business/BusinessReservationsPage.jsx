import { useState, useMemo, useEffect } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import CalendarGrid from '../../components/business/CalendarGrid'
import DayReservationList from '../../components/business/DayReservationList'
import businessService from '../../services/business.service'

// Eliminado MOCK_RESERVATIONS

function toKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BusinessReservationsPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [loading, setLoading] = useState(true)
  const [reservationsList, setReservationsList] = useState([])

  useEffect(() => {
    let isMounted = true
    const fetchReservations = async () => {
      try {
        setLoading(true)
        // Pedimos todas las reservaciones (sin date string) para pintar en el calendario o de un rango
        const data = await businessService.getReservations()
        if (isMounted) {
          setReservationsList(data.reservations || data) // Asegurar según la respuesta base (array o propiedad array)
        }
      } catch (error) {
        console.error('Error al cargar reservaciones:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchReservations()
    return () => { isMounted = false }
  }, [])

  const reservationDates = useMemo(
    () => new Set((Array.isArray(reservationsList) ? reservationsList : []).map((r) => r.date)),
    [reservationsList]
  )

  const dayReservations = useMemo(() => {
    const key = toKey(selectedDate)
    return (Array.isArray(reservationsList) ? reservationsList : [])
      .filter((r) => r.date === key)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [selectedDate, reservationsList])

  const handleMonthChange = (delta) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  return (
    <BusinessLayout>

      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Reservaciones</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Consulta y gestiona las reservaciones de tu negocio.
        </p>
      </section>

      {/* ── Calendario + lista del día ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <CalendarGrid
          year={year}
          month={month}
          selectedDate={selectedDate}
          reservationDates={reservationDates}
          onDateSelect={setSelectedDate}
          onMonthChange={handleMonthChange}
        />
        <DayReservationList
          reservations={dayReservations}
          loading={loading}
          selectedDate={selectedDate}
        />
      </section>

    </BusinessLayout>
  )
}
