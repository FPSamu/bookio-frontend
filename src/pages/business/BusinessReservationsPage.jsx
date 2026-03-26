import { useState, useMemo } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import CalendarGrid from '../../components/business/CalendarGrid'
import DayReservationList from '../../components/business/DayReservationList'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamada a la API (GET /business/reservations?date=YYYY-MM-DD)

const MOCK_RESERVATIONS = [
  // ── Restaurante ───────────────────────────────────────────────────────────
  {
    id: '1', clientName: 'Juan García', clientPhone: '55 1234 5678',
    partySize: 4, serviceName: 'Mesa interior', time: '13:00', duration: 90,
    status: 'confirmed', notes: 'Celebración de cumpleaños',
    date: '2026-03-26',
  },
  {
    id: '2', clientName: 'María López', clientPhone: '',
    partySize: 2, serviceName: 'Mesa terraza', time: '14:30', duration: 60,
    status: 'confirmed', notes: '',
    date: '2026-03-26',
  },
  {
    id: '3', clientName: 'Carlos Ruiz', clientPhone: '55 9876 5432',
    partySize: 6, serviceName: 'Salón privado', time: '20:00', duration: 120,
    status: 'pending', notes: 'Alergia a nueces',
    date: '2026-03-26',
  },
  {
    id: '4', clientName: 'Ana Martínez', clientPhone: '',
    partySize: 2, serviceName: 'Mesa interior', time: '21:00', duration: 90,
    status: 'cancelled', notes: '',
    date: '2026-03-26',
  },
  // ── Spa ───────────────────────────────────────────────────────────────────
  {
    id: '5', clientName: 'Sofía Torres', clientPhone: '55 5555 1234',
    partySize: 1, serviceName: 'Masaje relajación 60 min', time: '11:00', duration: 60,
    status: 'confirmed', notes: 'Prefiere presión media',
    date: '2026-03-28',
  },
  {
    id: '6', clientName: 'Roberto Sánchez', clientPhone: '',
    partySize: 2, serviceName: 'Ritual de pareja', time: '16:00', duration: 90,
    status: 'confirmed', notes: '',
    date: '2026-03-28',
  },
  // ── Médico ────────────────────────────────────────────────────────────────
  {
    id: '7', clientName: 'Laura Gómez', clientPhone: '55 4321 8765',
    partySize: 1, serviceName: 'Consulta dermatológica', time: '10:00', duration: 30,
    status: 'confirmed', notes: 'Primera visita',
    date: '2026-04-02',
  },
  {
    id: '8', clientName: 'Diego Hernández', clientPhone: '',
    partySize: 1, serviceName: 'Limpieza dental', time: '12:00', duration: 45,
    status: 'pending', notes: '',
    date: '2026-04-02',
  },
  // ── Salón ─────────────────────────────────────────────────────────────────
  {
    id: '9', clientName: 'Valeria Ríos', clientPhone: '55 7890 1234',
    partySize: 1, serviceName: 'Corte y coloración', time: '14:00', duration: 120,
    status: 'confirmed', notes: 'Balayage rubio',
    date: '2026-04-05',
  },
  {
    id: '10', clientName: 'Andrés Peña', clientPhone: '',
    partySize: 1, serviceName: 'Corte y barba', time: '17:30', duration: 45,
    status: 'confirmed', notes: '',
    date: '2026-04-05',
  },
]

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
  const [loading] = useState(false) // TODO: true mientras carga la API

  const reservationDates = useMemo(
    () => new Set(MOCK_RESERVATIONS.map((r) => r.date)),
    []
  )

  const dayReservations = useMemo(() => {
    const key = toKey(selectedDate)
    return MOCK_RESERVATIONS
      .filter((r) => r.date === key)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [selectedDate])

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
