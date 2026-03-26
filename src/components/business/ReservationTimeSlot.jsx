import ReservationStatusBadge from '../reservations/ReservationStatusBadge'

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

const STATUS_ACCENT = {
  confirmed: 'bg-emerald-500',
  pending:   'bg-amber-400',
  cancelled: 'bg-neutral-300',
}

export default function ReservationTimeSlot({ reservation, onStatusChange }) {
  const {
    clientName = 'Cliente',
    clientPhone = '',
    partySize = 1,
    serviceName = '',
    time = '',
    duration = null,
    status = 'pending',
    notes = '',
  } = reservation

  return (
    <div className="flex overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">

      {/* Acento de color por estado */}
      <div className={`w-1 flex-shrink-0 ${STATUS_ACCENT[status] ?? STATUS_ACCENT.pending}`} />

      {/* Columna de hora */}
      <div className="flex w-16 flex-shrink-0 flex-col items-center justify-center gap-0.5 border-r border-neutral-100 py-4 px-2">
        <span className="text-sm font-bold leading-none text-neutral-900">{time}</span>
        {duration && (
          <span className="text-[10px] text-neutral-400">~{duration}m</span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-3">

        {/* Nombre + badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-neutral-900 truncate">{clientName}</span>
          <ReservationStatusBadge status={status} />
        </div>

        {/* Servicio + comensales */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
          {serviceName && <span className="truncate">{serviceName}</span>}
          <span className="flex items-center gap-1">
            <UserIcon />
            {partySize} {partySize === 1 ? 'persona' : 'personas'}
          </span>
          {clientPhone && <span>{clientPhone}</span>}
        </div>

        {/* Notas */}
        {notes && (
          <div className="flex items-start gap-1 text-[11px] text-neutral-400">
            <NoteIcon />
            <span className="italic line-clamp-1">{notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}
