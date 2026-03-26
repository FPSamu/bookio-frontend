import RatingStars from '../ui/RatingStars'

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function HeartFilledIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

const PLACEHOLDER_GRADIENTS = [
  'from-violet-100 to-indigo-100',
  'from-amber-100 to-orange-100',
  'from-emerald-100 to-teal-100',
  'from-rose-100 to-pink-100',
  'from-sky-100 to-blue-100',
]

function placeholderGradient(id = '') {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]
}

export default function FavoriteCard({ business, onReserve, onRemove }) {
  const {
    id = '',
    name = 'Negocio',
    category = '',
    rating = 0,
    reviewCount = 0,
    imageUrl = null,
    location = '',
    tags = [],
    isOpen = true,
  } = business

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">

      {/* ── Imagen ── */}
      <div className="relative h-44 w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${placeholderGradient(id)}`} />
        )}

        {/* Badge de categoría */}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-sm">
            {category}
          </span>
        )}

        {/* Botón quitar de favoritos */}
        <button
          type="button"
          onClick={() => onRemove?.(business)}
          aria-label="Quitar de favoritos"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-rose-600"
        >
          <HeartFilledIcon />
        </button>
      </div>

      {/* ── Contenido ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Nombre + estado abierto/cerrado */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-neutral-900 line-clamp-1">
            {name}
          </h3>
          <span
            className={[
              'flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              isOpen
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-neutral-100 text-neutral-500',
            ].join(' ')}
          >
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <RatingStars value={rating} size="sm" showValue reviewCount={reviewCount} />
        </div>

        {/* Ubicación */}
        {location && (
          <div className="flex items-center gap-1 text-neutral-400">
            <LocationIcon />
            <span className="text-xs leading-none line-clamp-1">{location}</span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Botón reservar */}
        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={() => onReserve?.(business)}
            disabled={!isOpen}
            className="w-full rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reservar
          </button>
        </div>
      </div>
    </article>
  )
}
