function StarIcon({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )
}

export default function RatingFilter({ value = null, onChange }) {
  const handleClick = (star) => {
    // Click en la misma estrella activa → limpia el filtro
    onChange?.(value === star ? null : star)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 text-sm font-medium text-neutral-600">
        Calificación mínima
      </span>

      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            className={[
              'rounded p-0.5 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
              value !== null && star <= value
                ? 'text-amber-400'
                : 'text-neutral-300 hover:text-amber-300',
            ].join(' ')}
            aria-label={`Calificación mínima ${star}`}
            aria-pressed={value !== null && star <= value}
          >
            <StarIcon filled={value !== null && star <= value} />
          </button>
        ))}
      </div>

      {value !== null && (
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className="text-xs text-neutral-400 underline-offset-2 hover:text-neutral-700 hover:underline transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
