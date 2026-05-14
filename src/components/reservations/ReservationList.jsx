import ReservationCard from './ReservationCard'
import ReservationCardSkeleton from './ReservationCardSkeleton'

const EMPTY_MESSAGES = {
  upcoming:  'No tienes reservas próximas.',
  past:      'No tienes reservas pasadas.',
  cancelled: 'No tienes reservas canceladas.',
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-neutral-400">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="8" y2="14" />
          <line x1="12" y1="14" x2="12" y2="14" />
          <line x1="16" y1="14" x2="16" y2="14" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600">{message}</p>
        <p className="mt-1 text-xs text-neutral-400">Tus reservaciones aparecerán aquí.</p>
      </div>
    </div>
  )
}

export default function ReservationList({
  reservations = [],
  loading = false,
  skeletonCount = 4,
  activeTab = 'upcoming',
  onCancel,
  emptyMessage,
}) {
  const message = emptyMessage ?? EMPTY_MESSAGES[activeTab] ?? 'No hay reservas.'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {loading ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <ReservationCardSkeleton key={i} />
        ))
      ) : reservations.length === 0 ? (
        <div className="col-span-full">
          <EmptyState message={message} />
        </div>
      ) : (
        reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onCancel={onCancel}
          />
        ))
      )}
    </div>
  )
}
