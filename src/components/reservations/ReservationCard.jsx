import ReservationStatusBadge from './ReservationStatusBadge'

const MONTH_ABBR = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
]
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ScissorsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

export default function ReservationCard({ reservation, onCancel }) {
  const {
    businessName = 'Negocio',
    businessCategory = '',
    serviceName = '',
    date = null,
    time = '',
    status = 'pending',
    price = null,
    duration = null,
  } = reservation

  const dateObj = date ? new Date(date) : null
  const day = dateObj ? dateObj.getDate() : '--'
  const month = dateObj ? MONTH_ABBR[dateObj.getMonth()] : '---'
  const dayName = dateObj ? DAY_NAMES[dateObj.getDay()] : ''

  const canCancel = status === 'confirmed' || status === 'pending'

  return (
    <article className="flex overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]">

      {/* ── Bloque de fecha ── */}
      <div className="flex w-[68px] flex-shrink-0 flex-col items-center justify-center gap-0.5 border-r border-neutral-100 bg-neutral-50 py-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          {month}
        </span>
        <span className="text-3xl font-bold leading-none text-neutral-900">
          {day}
        </span>
        <span className="text-[11px] text-neutral-400">{dayName}</span>
      </div>

      {/* ── Contenido ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">

        {/* Nombre + badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-neutral-900">
              {businessName}
            </h3>
            {businessCategory && (
              <span className="text-xs text-neutral-400">{businessCategory}</span>
            )}
          </div>
          <ReservationStatusBadge status={status} />
        </div>

        {/* Servicio */}
        {serviceName && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <ScissorsIcon />
            <span className="truncate">{serviceName}</span>
          </div>
        )}

        {/* Hora · duración · precio */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {time && (
            <span className="flex items-center gap-1">
              <ClockIcon />
              {time}
            </span>
          )}
          {duration && <span>~{duration} min</span>}
          {price !== null && (
            <span className="ml-auto text-sm font-semibold text-neutral-700">
              ${price}
            </span>
          )}
        </div>

        {/* Cancelar */}
        {canCancel && (
          <div className="mt-auto pt-1">
            <button
              type="button"
              onClick={() => onCancel?.(reservation)}
              className="text-xs font-semibold text-red-500 transition-colors hover:text-red-700"
            >
              Cancelar reserva
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
