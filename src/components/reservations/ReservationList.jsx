import ReservationCard from './ReservationCard'
import ReservationCardSkeleton from './ReservationCardSkeleton'

const EMPTY_MESSAGES = {
  upcoming:  'No tienes reservas próximas.',
  past:      'No tienes reservas pasadas.',
  cancelled: 'No tienes reservas canceladas.',
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">📅</span>
      <p className="text-sm text-neutral-400">{message}</p>
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
    <div className="flex flex-col gap-3">
      {loading ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <ReservationCardSkeleton key={i} />
        ))
      ) : reservations.length === 0 ? (
        <EmptyState message={message} />
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
