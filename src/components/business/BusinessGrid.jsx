import BusinessCard from './BusinessCard'
import BusinessCardSkeleton from './BusinessCardSkeleton'

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">🔍</span>
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  )
}

export default function BusinessGrid({
  businesses = [],
  loading = false,
  skeletonCount = 6,
  onReserve,
  emptyMessage = 'No encontramos negocios con esos filtros.',
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <BusinessCardSkeleton key={i} />
        ))
      ) : businesses.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            onReserve={onReserve}
          />
        ))
      )}
    </div>
  )
}
