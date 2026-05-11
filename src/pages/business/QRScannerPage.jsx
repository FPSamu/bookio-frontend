import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import BusinessLayout from '../../layouts/BusinessLayout'
import { getAppointmentById, updateAppointmentStatus } from '../../services/appointments'

const STATUS_TRANSITIONS = {
  pending:     [{ value: 'CONFIRMED',   label: 'Confirmar' }, { value: 'CANCELLED', label: 'Cancelar' }],
  confirmed:   [{ value: 'IN_PROGRESS', label: 'Iniciar'   }, { value: 'CANCELLED', label: 'Cancelar' }],
  in_progress: [{ value: 'COMPLETED',   label: 'Completar' }],
  completed:   [],
  cancelled:   [],
}

const STATUS_LABEL = {
  pending:     'Pendiente',
  confirmed:   'Confirmada',
  in_progress: 'En proceso',
  completed:   'Completada',
  cancelled:   'Cancelada',
}

const STATUS_COLOR = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed:   'bg-neutral-100 text-neutral-600 border-neutral-200',
  cancelled:   'bg-neutral-100 text-neutral-400 border-neutral-200',
}

function AppointmentSheet({ appointment, onStatusChange, onClose, updating }) {
  const transitions = STATUS_TRANSITIONS[appointment.status] ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-neutral-900">{appointment.businessName || 'Cita'}</p>
            {appointment.serviceName && (
              <p className="text-sm text-neutral-500">{appointment.serviceName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-neutral-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Detalles */}
        <div className="mt-4 space-y-2 text-sm text-neutral-600">
          {appointment.clientName && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Cliente</span>
              <span className="font-medium">{appointment.clientName || '—'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-400">Fecha</span>
            <span className="font-medium">{appointment.date ? new Date(appointment.date).toLocaleDateString('es-MX') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Hora</span>
            <span className="font-medium">{appointment.time || '—'}</span>
          </div>
        </div>

        {/* Estado */}
        <div className="mt-4">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[appointment.status] ?? STATUS_COLOR.pending}`}>
            {STATUS_LABEL[appointment.status] ?? appointment.status}
          </span>
        </div>

        {/* Acciones */}
        {transitions.length > 0 && (
          <div className="mt-5 flex gap-2">
            {transitions.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onStatusChange(t.value)}
                disabled={updating}
                className={[
                  'flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
                  t.value === 'CANCELLED'
                    ? 'border border-red-200 text-red-500 hover:bg-red-50'
                    : 'bg-neutral-900 text-white hover:bg-neutral-700',
                ].join(' ')}
              >
                {updating ? '…' : t.label}
              </button>
            ))}
          </div>
        )}

        {transitions.length === 0 && (
          <p className="mt-4 text-center text-xs text-neutral-400">Esta cita no tiene acciones disponibles.</p>
        )}
      </div>
    </div>
  )
}

async function safeStop(qrcode) {
  if (!qrcode) return
  try {
    if (qrcode.isScanning) await qrcode.stop()
  } catch {}
  try { qrcode.clear() } catch {}
}

export default function QRScannerPage() {
  const [phase,       setPhase]       = useState('scanning')
  const [appointment, setAppointment] = useState(null)
  const [error,       setError]       = useState('')
  const [updating,    setUpdating]    = useState(false)

  const qrcodeRef  = useRef(null)
  const disposedRef = useRef(false)

  async function launchScanner() {
    // Limpia el div antes de inicializar (necesario en re-arranques)
    const el = document.getElementById('qr-reader')
    if (el) el.innerHTML = ''

    const qrcode = new Html5Qrcode('qr-reader')
    qrcodeRef.current = qrcode

    try {
      await qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (text) => {
          if (disposedRef.current) return
          await safeStop(qrcode)
          setPhase('fetching')
          setError('')
          try {
            const appt = await getAppointmentById(text.trim())
            if (!appt) throw new Error('not found')
            setAppointment(appt)
            setPhase('found')
          } catch {
            setError('No se encontró ninguna cita con ese código.')
            setPhase('error')
          }
        },
        () => {}
      )
    } catch {
      if (!disposedRef.current) {
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
        setPhase('error')
      }
    }
  }

  useEffect(() => {
    disposedRef.current = false

    // setTimeout(0) permite que el cleanup de StrictMode cancele el timer
    // antes de que arranque, evitando la doble inicialización en desarrollo.
    const timer = setTimeout(() => {
      if (!disposedRef.current) launchScanner()
    }, 0)

    return () => {
      disposedRef.current = true
      clearTimeout(timer)
      safeStop(qrcodeRef.current)
      qrcodeRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(newStatus) {
    if (!appointment) return
    setUpdating(true)
    try {
      await updateAppointmentStatus(appointment.id, newStatus)
      setAppointment((prev) => ({ ...prev, status: newStatus.toLowerCase() }))
    } catch {
      setError('No se pudo actualizar el estado. Intenta de nuevo.')
    } finally {
      setUpdating(false)
    }
  }

  async function handleScanAgain() {
    setAppointment(null)
    setError('')
    setPhase('scanning')
    await launchScanner()
  }

  return (
    <BusinessLayout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Escanear QR</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Apunta la cámara al código QR del cliente para registrar su llegada.
        </p>
      </section>

      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">

        {error && (
          <div className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {phase === 'fetching' && (
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Buscando cita…
          </div>
        )}

        {/* El div siempre está montado; se oculta visualmente cuando no se escanea */}
        <div className={`w-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm ${phase !== 'scanning' ? 'hidden' : ''}`}>
          <div id="qr-reader" className="w-full" />
        </div>

        {(phase === 'error' || (phase === 'found' && !appointment)) && (
          <button
            type="button"
            onClick={handleScanAgain}
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Escanear de nuevo
          </button>
        )}
      </div>

      {appointment && (
        <AppointmentSheet
          appointment={appointment}
          onStatusChange={handleStatusChange}
          onClose={handleScanAgain}
          updating={updating}
        />
      )}
    </BusinessLayout>
  )
}
