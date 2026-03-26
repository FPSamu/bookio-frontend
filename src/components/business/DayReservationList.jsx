import ReservationTimeSlot from './ReservationTimeSlot'
import ReservationTimeSlotSkeleton from './ReservationTimeSlotSkeleton'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function formatDate(date) {
  if (!date) return ''
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="text-4xl">📭</span>
      <p className="text-sm text-neutral-400">No hay reservaciones para este día.</p>
    </div>
  )
}

export default function DayReservationList({
  reservations = [],
  loading = false,
  skeletonCount = 3,
  selectedDate = null,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 capitalize">
            {formatDate(selectedDate) || 'Selecciona un día'}
          </h2>
          {!loading && reservations.length > 0 && (
            <p className="text-xs text-neutral-400">
              {reservations.length} reservación{reservations.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Lista ── */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          Array.from({ length: skeletonCount }, (_, i) => (
            <ReservationTimeSlotSkeleton key={i} />
          ))
        ) : reservations.length === 0 ? (
          <EmptyState />
        ) : (
          reservations.map((reservation) => (
            <ReservationTimeSlot
              key={reservation.id}
              reservation={reservation}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}
