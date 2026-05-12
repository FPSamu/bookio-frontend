import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReservationStatusBadge from './ReservationStatusBadge'

const TYPE_GRADIENT = {
  restaurant: 'from-orange-400 to-amber-300',
  spa:        'from-emerald-400 to-teal-300',
  salon:      'from-violet-400 to-purple-300',
  barbershop: 'from-amber-500 to-yellow-400',
  medical:    'from-sky-400 to-blue-300',
  other:      'from-neutral-400 to-neutral-300',
}

const MONTH_NAMES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DAY_NAMES   = ['dom','lun','mar','mié','jue','vie','sáb']

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

export default function ReservationCard({ reservation, onCancel }) {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const {
    id               = '',
    businessName     = 'Negocio',
    businessType     = 'other',
    businessLogoUrl  = null,
    businessImageUrl = null,
    businessAddress  = null,
    serviceName      = '',
    date             = null,
    time             = '',
    status           = 'pending',
    price            = null,
    duration         = null,
  } = reservation

  const bannerSrc = businessImageUrl || businessLogoUrl

  const dateObj = date ? new Date(date) : null
  const formattedDate = dateObj
    ? `${DAY_NAMES[dateObj.getDay()]}, ${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    : null

  const gradient = TYPE_GRADIENT[businessType] ?? TYPE_GRADIENT.other
  const canCancel = status === 'confirmed' || status === 'pending'

  function goToDetail(e) {
    e?.stopPropagation()
    navigate(`/reservations/${id}`, { state: { reservation } })
  }

  return (
    <article
      onClick={goToDetail}
      className="group overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    >
      {/* Photo / color banner */}
      <div className="relative h-44 overflow-hidden">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={businessName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Big time overlay */}
        <div className="absolute bottom-3 left-4 right-20">
          <p className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-sm">
            {time || '—'}
          </p>
          {formattedDate && (
            <p className="mt-1 text-xs font-medium text-white/70 capitalize">{formattedDate}</p>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <ReservationStatusBadge status={status} />
        </div>

        {/* Small logo overlay (bottom right) */}
        {businessLogoUrl && businessLogoUrl !== bannerSrc && (
          <div className="absolute bottom-3 right-4">
            <img
              src={businessLogoUrl}
              alt=""
              className="h-9 w-9 rounded-xl object-cover border-2 border-white shadow-md"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[15px] text-neutral-900 line-clamp-1 leading-snug">
            {businessName}
          </h3>
          {price !== null && (
            <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
              ${Number(price).toLocaleString('es-MX')}
            </span>
          )}
        </div>

        {serviceName && (
          <p className="text-sm text-neutral-500 mb-2 line-clamp-1">
            {serviceName}
            {duration && <span className="text-neutral-400"> · ~{duration} min</span>}
          </p>
        )}

        {businessAddress && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
            <PinIcon />
            <span className="line-clamp-1">{businessAddress}</span>
          </div>
        )}

        {!businessAddress && time && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
            <ClockIcon />
            <span>{time}{duration && ` · ~${duration} min`}</span>
          </div>
        )}

        {canCancel && !confirming && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
            className="mt-1 w-full rounded-xl border border-red-100 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
          >
            Cancelar reserva
          </button>
        )}

        {confirming && (
          <div
            className="mt-2 rounded-2xl border border-red-100 bg-red-50 p-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <p className="mb-1 text-center text-sm font-bold text-red-700">¿Cancelar reserva?</p>
            <p className="mb-4 text-center text-xs text-red-500">
              {businessName}{serviceName ? ` · ${serviceName}` : ''}
              {formattedDate ? ` · ${time}` : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 active:scale-[0.98]"
              >
                No, regresar
              </button>
              <button
                type="button"
                onClick={() => onCancel?.(reservation)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 active:scale-[0.98]"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
