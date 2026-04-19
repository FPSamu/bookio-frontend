import { useState, useMemo, useEffect } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import CalendarGrid from '../../components/business/CalendarGrid'
import DayReservationList from '../../components/business/DayReservationList'
import { getBusinessReservations } from '../../services/businesses'

function toKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export default function BusinessReservationsPage() {
  const today = new Date()
  const [allReservations, setAllReservations] = useState([])
  const [selectedDate,    setSelectedDate]    = useState(today)
  const [year,            setYear]            = useState(today.getFullYear())
  const [month,           setMonth]           = useState(today.getMonth())
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const data = await getBusinessReservations()
        if (!cancelled) setAllReservations(data)
      } catch (err) {
        console.error('Error cargando reservaciones:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const reservationDates = useMemo(
    () => new Set(allReservations.map((r) => r.date)),
    [allReservations]
  )

  const dayReservations = useMemo(() => {
    const key = toKey(selectedDate)
    return allReservations
      .filter((r) => r.date === key)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [allReservations, selectedDate])

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
