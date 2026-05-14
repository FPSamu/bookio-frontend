import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate   = useNavigate()
  const today      = new Date()
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Reservaciones</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Consulta y gestiona las reservaciones de tu negocio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/business/scanner')}
            className="flex flex-shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 active:scale-[0.97] transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            <span className="hidden sm:inline">Escanear QR</span>
          </button>
        </div>
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
