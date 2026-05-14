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
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-neutral-400">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="15" x2="12" y2="15" />
          <line x1="12" y1="19" x2="12" y2="19" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600">Sin reservaciones</p>
        <p className="mt-0.5 text-xs text-neutral-400">No hay reservaciones para este día.</p>
      </div>
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
