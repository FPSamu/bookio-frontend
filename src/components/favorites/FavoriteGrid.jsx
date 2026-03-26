import FavoriteCard from './FavoriteCard'
import FavoriteCardSkeleton from './FavoriteCardSkeleton'

function EmptyState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl">🤍</span>
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  )
}

export default function FavoriteGrid({
  businesses = [],
  loading = false,
  skeletonCount = 6,
  onReserve,
  onRemove,
  emptyMessage = 'Aún no tienes favoritos. ¡Explora y guarda los que más te gusten!',
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <FavoriteCardSkeleton key={i} />
        ))
      ) : businesses.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        businesses.map((business) => (
          <FavoriteCard
            key={business.id}
            business={business}
            onReserve={onReserve}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  )
}
