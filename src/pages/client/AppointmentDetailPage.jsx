import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ClientLayout from '../../layouts/ClientLayout'
import { cancelAppointment } from '../../services/appointments'
import { getReviewByAppointment, submitReview } from '../../services/reviews'
import { useAuth } from '../../context/AuthContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFullDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`
}

function formatTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const period = h >= 12 ? 'PM' : 'AM'
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:${m} ${period}`
}

function isUpcoming(dateStr, status) {
  if (!dateStr || status === 'cancelled') return false
  return new Date(dateStr) > new Date()
}

// ── Map pin icon ──────────────────────────────────────────────────────────────

const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg width="28" height="38" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16C0 27 16 42 16 42C16 42 32 27 32 16C32 7.163 24.837 0 16 0Z" fill="#171717"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
})

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed:   { label: 'Confirmada',  bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  pending:     { label: 'Pendiente',   bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  cancelled:   { label: 'Cancelada',   bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200', dot: 'bg-neutral-400' },
  completed:   { label: 'Completada',  bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-200', dot: 'bg-neutral-400' },
  in_progress: { label: 'En proceso',  bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ value, onChange, readonly = false, size = 28 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange?.(n)}
          disabled={readonly}
          className={readonly ? 'cursor-default' : 'transition-transform hover:scale-110'}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
            fill={n <= value ? '#fbbf24' : 'none'}
            stroke={n <= value ? '#fbbf24' : '#d1d5db'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center gap-3 bg-red-50 px-6 pt-7 pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-red-500">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-base font-bold text-neutral-900">¿Cancelar cita?</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-neutral-500 text-center">Esta acción no se puede deshacer.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
              Cerrar
            </button>
            <button type="button" onClick={onConfirm} disabled={loading}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
              {loading ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AppointmentDetailPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const reservation = location.state?.reservation ?? null

  const [status,        setStatus]        = useState(reservation?.status ?? '')
  const [showModal,     setShowModal]     = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [copied,        setCopied]        = useState(false)

  // Review state
  const [loadedRating,   setLoadedRating]   = useState(reservation?.rating     ?? null)
  const [loadedReviewText, setLoadedReviewText] = useState(reservation?.reviewText ?? null)
  const [reviewScore,    setReviewScore]   = useState(0)
  const [reviewComment,  setReviewComment] = useState('')
  const [reviewLoading,  setReviewLoading] = useState(false)
  const [reviewError,    setReviewError]   = useState('')
  const [reviewDone,     setReviewDone]    = useState(false)

  // Load real review from API on mount
  useEffect(() => {
    if (!reservation?.id) return
    getReviewByAppointment(reservation.id)
      .then(r => {
        if (r) {
          setLoadedRating(r.score ?? r.rating ?? null)
          setLoadedReviewText(r.comment ?? r.review_text ?? null)
        }
      })
      .catch(() => {}) // fail silently, fallback to state
  }, [reservation?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!reservation) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-neutral-500">No encontramos esta reserva.</p>
          <button type="button" onClick={() => navigate('/reservations')}
            className="text-sm font-semibold text-neutral-900 underline">
            Ver mis reservas
          </button>
        </div>
      </ClientLayout>
    )
  }

  const {
    id,
    businessId,
    businessName,
    businessLogoUrl,
    businessPhone,
    businessAddress,
    businessLatitude,
    businessLongitude,
    serviceName,
    date,
    time,
    duration,
    price,
  } = reservation

  const isPast    = date ? new Date(date) < new Date() : false
  const upcoming  = isUpcoming(date, status)
  const shortId   = id.length > 8 ? id.substring(0, 8).toUpperCase() : id.toUpperCase()

  const existingRating     = loadedRating
  const existingReviewText = loadedReviewText
  const hasReview = !!existingRating || reviewDone
  const canReview = isPast && status !== 'cancelled' && !hasReview

  const mapsUrl = businessLatitude && businessLongitude
    ? `https://www.google.com/maps/search/?api=1&query=${businessLatitude},${businessLongitude}`
    : businessAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessAddress)}`
      : null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  async function handleCancel() {
    setCancelLoading(true)
    try {
      await cancelAppointment(id)
      setStatus('cancelled')
      setShowModal(false)
    } catch (err) {
      console.error('Error cancelando cita:', err)
    } finally {
      setCancelLoading(false)
    }
  }

  async function handleReview(e) {
    e.preventDefault()
    if (reviewScore === 0) { setReviewError('Selecciona una calificación.'); return }
    setReviewError('')
    setReviewLoading(true)
    try {
      await submitReview({
        appointmentId: id,
        businessId,
        clientId: user?.id,
        score: reviewScore,
        comment: reviewComment.trim(),
      })
      setReviewDone(true)
    } catch {
      setReviewError('No se pudo enviar la reseña. Intenta de nuevo.')
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <ClientLayout>
      {/* Back */}
      <div className="mb-4">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
          <BackIcon />
          Volver
        </button>
      </div>

      <div className="space-y-4 pb-8">

        {/* ── HERO ── */}
        <Card className="text-center">
          <div className="flex flex-col items-center gap-3 py-2">
            {businessLogoUrl ? (
              <img src={businessLogoUrl} alt={businessName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-neutral-100" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-neutral-400">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{businessName}</h1>
              {serviceName && <p className="mt-1 text-sm font-semibold text-neutral-500">{serviceName}</p>}
            </div>
            <StatusBadge status={status} />
          </div>
        </Card>

        {/* ── FECHA / HORA / DURACIÓN / PRECIO ── */}
        <Card>
          <div className="divide-y divide-neutral-50">
            <InfoRow icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            } label="Fecha" value={formatFullDate(date)} />
            <InfoRow icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            } label="Hora" value={formatTime(date)} />
            {duration && (
              <InfoRow icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              } label="Duración" value={`${duration} minutos`} />
            )}
            {price !== null && (
              <InfoRow icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              } label="Precio" value={`$${price.toFixed(2)}`} />
            )}
          </div>
        </Card>

        {/* ── TELÉFONO ── */}
        {businessPhone && (
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Teléfono</p>
                <p className="text-sm font-semibold text-neutral-900">{businessPhone}</p>
              </div>
              <a href={`tel:${businessPhone}`}
                className="flex-shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-200 transition-colors">
                Llamar
              </a>
            </div>
          </Card>
        )}

        {/* ── CÓDIGO QR ── */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-neutral-900">Código QR</p>
              <p className="text-xs text-neutral-400">Muéstralo al llegar</p>
            </div>
            <button type="button" onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-xs font-semibold text-neutral-500 hover:bg-neutral-200 transition-colors"
              title="Copiar ID">
              #{shortId}
              <CopyIcon />
              {copied && <span className="text-emerald-600 not-italic">✓</span>}
            </button>
          </div>
          <div className="mt-5 flex justify-center">
            <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-neutral-100">
              <QRCodeSVG value={id} size={180} level="M" includeMargin={false} />
            </div>
          </div>
        </Card>

        {/* ── UBICACIÓN con mapa Leaflet ── */}
        {(businessAddress || businessLatitude) && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-neutral-900">Ubicación</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors">
                  Abrir en Maps <ExternalLinkIcon />
                </a>
              )}
            </div>

            {businessLatitude && businessLongitude ? (
              <div className="overflow-hidden rounded-xl border border-neutral-100" style={{ height: 200 }}>
                <MapContainer
                  center={[businessLatitude, businessLongitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[businessLatitude, businessLongitude]} icon={PIN_ICON} />
                </MapContainer>
              </div>
            ) : mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex h-20 w-full items-center justify-center gap-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-neutral-400">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-sm font-medium text-neutral-500">Ver en Google Maps</span>
              </a>
            ) : null}

            {businessAddress && (
              <div className="mt-3 flex items-start gap-2 text-sm text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="mt-0.5 flex-shrink-0 text-neutral-400">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{businessAddress}</span>
              </div>
            )}
          </Card>
        )}

        {/* ── RESEÑA ── */}
        {reviewDone ? (
          /* Acaba de enviar ahora mismo */
          <Card className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-emerald-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-bold text-neutral-900">¡Gracias por tu reseña!</p>
              <Stars value={reviewScore} readonly size={20} />
            </div>
          </Card>
        ) : existingRating ? (
          /* Ya tenía reseña previa */
          <Card>
            <p className="text-sm font-bold text-neutral-900 mb-3">Tu reseña</p>
            <Stars value={existingRating} readonly size={22} />
            {existingReviewText && (
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{existingReviewText}</p>
            )}
          </Card>
        ) : canReview ? (
          /* Puede dejar reseña */
          <Card>
            <p className="text-sm font-bold text-neutral-900">Deja tu reseña</p>
            <p className="mt-0.5 text-xs text-neutral-400 mb-4">¿Cómo fue tu experiencia?</p>
            <form onSubmit={handleReview} className="flex flex-col gap-4">
              <Stars value={reviewScore} onChange={setReviewScore} size={32} />
              <textarea
                rows={3}
                placeholder="Cuéntanos más (opcional)"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white transition-colors"
              />
              {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
              <button type="submit" disabled={reviewLoading}
                className="rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                {reviewLoading ? 'Enviando…' : 'Enviar reseña'}
              </button>
            </form>
          </Card>
        ) : null}

        {/* ── CANCELAR ── */}
        {upcoming && (
          <button type="button" onClick={() => setShowModal(true)}
            className="w-full rounded-full border border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            Cancelar cita
          </button>
        )}
      </div>

      {showModal && (
        <CancelModal loading={cancelLoading} onConfirm={handleCancel} onClose={() => setShowModal(false)} />
      )}
    </ClientLayout>
  )
}
