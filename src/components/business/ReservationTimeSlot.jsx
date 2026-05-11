import { useState } from 'react'
import ReservationStatusBadge from '../reservations/ReservationStatusBadge'
import { updateAppointmentStatus } from '../../services/appointments'

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
  confirmed:   'bg-emerald-500',
  pending:     'bg-amber-400',
  cancelled:   'bg-neutral-300',
  in_progress: 'bg-blue-500',
  completed:   'bg-neutral-400',
}

const STATUS_ACTIONS = {
  pending:     [{ value: 'CONFIRMED',   label: 'Confirmar', style: 'text-emerald-600 hover:bg-emerald-50' },
                { value: 'CANCELLED',   label: 'Cancelar',  style: 'text-red-500 hover:bg-red-50'        }],
  confirmed:   [{ value: 'IN_PROGRESS', label: 'Iniciar',   style: 'text-blue-600 hover:bg-blue-50'      },
                { value: 'CANCELLED',   label: 'Cancelar',  style: 'text-red-500 hover:bg-red-50'        }],
  in_progress: [{ value: 'COMPLETED',   label: 'Completar', style: 'text-neutral-600 hover:bg-neutral-100'}],
  completed:   [],
  cancelled:   [],
}

export default function ReservationTimeSlot({ reservation, onStatusChange }) {
  const {
    id = '',
    clientName = 'Cliente',
    clientPhone = '',
    partySize = 1,
    serviceName = '',
    time = '',
    duration = null,
    status: initialStatus = 'pending',
    notes = '',
  } = reservation

  const [status,   setStatus]   = useState(initialStatus)
  const [updating, setUpdating] = useState(false)

  async function handleAction(newStatus) {
    setUpdating(true)
    try {
      await updateAppointmentStatus(id, newStatus)
      const next = newStatus.toLowerCase()
      setStatus(next)
      onStatusChange?.({ ...reservation, status: next })
    } catch {
      // silently ignore; status stays the same
    } finally {
      setUpdating(false)
    }
  }

  const actions = STATUS_ACTIONS[status] ?? []

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

        {/* Acciones de estado */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 pt-0.5">
            {actions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => handleAction(action.value)}
                disabled={updating}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-40 ${action.style}`}
              >
                {updating ? '…' : action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
