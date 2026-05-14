import { useNavigate } from 'react-router-dom'
import RatingStars from '../ui/RatingStars'

const TYPE_CONFIG = {
  restaurant: { label: 'Restaurante', placeholder: 'from-orange-100 to-amber-50' },
  spa:        { label: 'Spa',         placeholder: 'from-emerald-100 to-teal-50' },
  salon:      { label: 'Salón',       placeholder: 'from-violet-100 to-purple-50' },
  barbershop: { label: 'Barbería',    placeholder: 'from-amber-100 to-yellow-50' },
  medical:    { label: 'Médico',      placeholder: 'from-sky-100 to-blue-50' },
  other:      { label: 'Negocio',     placeholder: 'from-neutral-100 to-neutral-50' },
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

export default function BusinessCard({ business }) {
  const navigate = useNavigate()
  const {
    id          = '',
    name        = 'Negocio',
    type        = 'other',
    rating      = 0,
    reviewCount = 0,
    imageUrl    = null,
    location    = '',
    isOpen      = null,
  } = business

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other

  const goToDetail = () => navigate(`/business/${id}`)
  const handleReserve = (e) => { e.stopPropagation(); navigate(`/booking/${id}`) }

  return (
    <article
      onClick={goToDetail}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${cfg.placeholder}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}

        {imageUrl && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        )}

        <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-sm">
          {cfg.label}
        </span>

        {isOpen !== null && (
          <span className={[
            'absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm',
            isOpen ? 'bg-emerald-500 text-white' : 'bg-neutral-800/80 text-white backdrop-blur-sm',
          ].join(' ')}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-2.5">
        <h3 className="text-[15px] font-bold leading-snug text-neutral-900 line-clamp-1">
          {name}
        </h3>

        <div className="flex items-center gap-1.5">
          <RatingStars value={rating} size="sm" />
          <span className="text-xs font-bold text-neutral-800">{rating.toFixed(1)}</span>
          <span className="text-xs text-neutral-400">({reviewCount})</span>
        </div>

        {location && (
          <div className="flex items-center gap-1 text-neutral-400">
            <PinIcon />
            <span className="text-xs line-clamp-1">{location}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleReserve}
          className="mt-auto w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-neutral-700 active:scale-[0.98]"
        >
          Reservar
        </button>
      </div>
    </article>
  )
}
