import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ClientLayout from '../../layouts/ClientLayout'
import RatingStars from '../../components/ui/RatingStars'
import {
  getBusinessById,
  getBusinessServices,
  getBusinessSchedule,
  getBusinessReviews,
} from '../../services/businesses'

// ── Constants ────────────────────────────────────────────────────────────────
const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_FULL  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const TODAY     = new Date().getDay()

const TYPE_CONFIG = {
  restaurant: { label: 'Restaurante', bg: 'bg-orange-50',  text: 'text-orange-600',  accent: 'bg-orange-500',  gradient: 'from-orange-100 to-amber-50' },
  spa:        { label: 'Spa',         bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500', gradient: 'from-emerald-100 to-teal-50' },
  salon:      { label: 'Salón',       bg: 'bg-violet-50',  text: 'text-violet-700',  accent: 'bg-violet-500',  gradient: 'from-violet-100 to-purple-50' },
  barbershop: { label: 'Barbería',    bg: 'bg-amber-50',   text: 'text-amber-700',   accent: 'bg-amber-500',   gradient: 'from-amber-100 to-yellow-50' },
  medical:    { label: 'Médico',      bg: 'bg-sky-50',     text: 'text-sky-700',     accent: 'bg-sky-500',     gradient: 'from-sky-100 to-blue-50' },
  other:      { label: 'Negocio',     bg: 'bg-neutral-100',text: 'text-neutral-600', accent: 'bg-neutral-500', gradient: 'from-neutral-100 to-neutral-50' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt12(t = '') {
  const [h, m] = t.split(':')
  const hr = parseInt(h, 10)
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${(m || '00').padStart(2, '0')} ${hr >= 12 ? 'PM' : 'AM'}`
}

function buildGroups(schedule) {
  const groups = []
  for (const e of schedule) {
    const key = `${e.start_time}|${e.end_time}`
    const g = groups.find(g => g.key === key)
    if (g) g.days.push(e.day_of_week)
    else groups.push({ key, days: [e.day_of_week], start: e.start_time || '', end: e.end_time || '' })
  }
  return groups.sort((a, b) => Math.min(...a.days) - Math.min(...b.days))
}

function groupLabel(g) {
  const sorted = [...g.days].sort((a, b) => a - b)
  if (sorted.length === 1) return DAY_FULL[sorted[0]]
  const consec = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1)
  if (consec && sorted.length > 2) return `${DAY_SHORT[sorted[0]]} – ${DAY_SHORT[sorted[sorted.length - 1]]}`
  return sorted.map(d => DAY_SHORT[d]).join(', ')
}

function groupIsToday(g) { return g.days.includes(TODAY) }

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Ico = (p) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p} />
)
const BackIcon    = () => <Ico width="16" height="16"><polyline points="15 18 9 12 15 6"/></Ico>
const PinIcon     = () => <Ico width="13" height="13"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>
const PhoneIcon   = () => <Ico width="13" height="13"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 21.73 16.92z"/></Ico>
const ExternalIcon = () => <Ico width="11" height="11"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Ico>
const StarFillIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
const ImagePlaceholder = () => (
  <Ico width="28" height="28" className="text-neutral-300">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </Ico>
)

// ── Map icons (divIcon avoids Vite asset issues with default Leaflet icons) ───
const ACCENT_COLORS = {
  restaurant: '#f97316', spa: '#10b981', salon: '#8b5cf6',
  barbershop: '#f59e0b', medical: '#0ea5e9', other:  '#737373',
}

function buildBusinessIcon(type) {
  const color = ACCENT_COLORS[type] ?? '#171717'
  return L.divIcon({
    className: '',
    html: `<svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.611 0 0 7.611 0 17C0 28 17 44 17 44C17 44 34 28 34 17C34 7.611 26.389 0 17 0Z" fill="${color}"/>
      <circle cx="17" cy="17" r="7" fill="white"/>
    </svg>`,
    iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -46],
  })
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(59,130,246,0.2),0 2px 8px rgba(0,0,0,0.2)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
})

// ── Map fly-to controller (must live inside MapContainer) ─────────────────────
function MapController({ userPos, businessPos }) {
  const map = useMap()
  useEffect(() => {
    if (userPos) {
      const bounds = L.latLngBounds([businessPos, userPos])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true })
    }
  }, [userPos])
  return null
}

// ── Business map section ──────────────────────────────────────────────────────
function BusinessMap({ lat, lng, type, name }) {
  const [userPos,  setUserPos]  = useState(null)
  const [locating, setLocating] = useState(false)
  const [locErr,   setLocErr]   = useState(null)
  const [distance, setDistance] = useState(null)

  if (!lat || !lng) return null

  const businessPos = [lat, lng]
  const icon = buildBusinessIcon(type)

  function handleLocate() {
    setLocating(true)
    setLocErr(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPos([latitude, longitude])
        setLocating(false)
        // haversine distance in km
        const R = 6371
        const dLat = (latitude - lat) * Math.PI / 180
        const dLng = (longitude - lng) * Math.PI / 180
        const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(latitude*Math.PI/180)*Math.sin(dLng/2)**2
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        setDistance(d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`)
      },
      () => { setLocating(false); setLocErr('No se pudo obtener tu ubicación') }
    )
  }

  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-100 shadow-sm" style={{ height: 240 }}>
      <MapContainer
        center={businessPos}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <Marker position={businessPos} icon={icon} />
        {userPos && <Marker position={userPos} icon={USER_ICON} />}
        <MapController userPos={userPos} businessPos={businessPos} />
      </MapContainer>

      {/* Google Maps link — top right */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
      >
        <ExternalIcon />
        Google Maps
      </a>

      {/* Bottom controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex items-end justify-between gap-3 p-3">
        {distance ? (
          <span className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-md backdrop-blur-sm">
            📍 A {distance}
          </span>
        ) : <span />}

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating || !!userPos}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-800 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-[0.97] disabled:opacity-60"
        >
          {locating ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
              Localizando…
            </>
          ) : userPos ? (
            <>
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
              ✓ Ubicado
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
              Mi ubicación
            </>
          )}
        </button>
      </div>

      {locErr && (
        <p className="absolute bottom-14 inset-x-0 z-[1000] text-center text-xs text-red-500">{locErr}</p>
      )}
    </div>
  )
}

// ── Lightbox — rendered via portal so it always escapes stacking contexts ────
function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index)
  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent(c => (c + 1) % photos.length)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/95 animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      {/* Counter */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-[0.2em] text-white/50 uppercase select-none">
        {current + 1} / {photos.length}
      </p>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <Ico width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ico>
      </button>

      {/* Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Ico width="20" height="20"><polyline points="15 18 9 12 15 6"/></Ico>
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Ico width="20" height="20"><polyline points="9 18 15 12 9 6"/></Ico>
          </button>
        </>
      )}

      {/* Image */}
      <img
        src={photos[current]}
        alt=""
        className="max-h-[86vh] max-w-[90vw] object-contain select-none"
        onClick={e => e.stopPropagation()}
      />

      {/* Dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-7 bg-white' : 'w-2 bg-white/35'}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}

// ── Photo cell helper ─────────────────────────────────────────────────────────
function PhotoCell({ url, alt, onClick, overlay }) {
  return (
    <div
      className="relative cursor-zoom-in overflow-hidden bg-neutral-100"
      onClick={onClick}
    >
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
          <span className="text-lg font-black text-white">{overlay}</span>
        </div>
      )}
    </div>
  )
}

// ── Photo Gallery ─────────────────────────────────────────────────────────────
function PhotoGallery({ photos, name, gradient }) {
  const [lightbox, setLightbox] = useState(null)
  const shown = photos.slice(0, 4)
  const count = shown.length
  const open  = (i) => setLightbox(i)

  if (count === 0) {
    return (
      <div className={`flex h-72 w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
        <ImagePlaceholder />
      </div>
    )
  }

  let grid

  if (count === 1) {
    /* ── 1 photo: full-width hero ── */
    grid = (
      <div className="h-[420px] overflow-hidden cursor-zoom-in bg-neutral-100" onClick={() => open(0)}>
        <img
          src={shown[0]} alt={name}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>
    )
  } else if (count === 2) {
    /* ── 2 photos: equal halves ── */
    grid = (
      <div className="grid grid-cols-2 gap-0.5 h-[320px]">
        <PhotoCell url={shown[0]} alt={name}        onClick={() => open(0)} />
        <PhotoCell url={shown[1]} alt={`${name} 2`} onClick={() => open(1)} />
      </div>
    )
  } else if (count === 3) {
    /* ── 3 photos: wide left + 2 stacked right ── */
    grid = (
      <div className="grid gap-0.5 h-[380px]" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <PhotoCell url={shown[0]} alt={name} onClick={() => open(0)} />
        <div className="grid grid-rows-2 gap-0.5">
          <PhotoCell url={shown[1]} alt={`${name} 2`} onClick={() => open(1)} />
          <PhotoCell url={shown[2]} alt={`${name} 3`} onClick={() => open(2)} />
        </div>
      </div>
    )
  } else {
    /* ── 4 photos: wide left + 3 stacked right (Airbnb style) ── */
    const extraLabel = photos.length > 4 ? `+${photos.length - 4}` : null
    grid = (
      <div className="grid gap-0.5 h-[400px]" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <PhotoCell url={shown[0]} alt={name} onClick={() => open(0)} />
        <div className="grid grid-rows-3 gap-0.5">
          <PhotoCell url={shown[1]} alt={`${name} 2`} onClick={() => open(1)} />
          <PhotoCell url={shown[2]} alt={`${name} 3`} onClick={() => open(2)} />
          <PhotoCell
            url={shown[3]} alt={`${name} 4`} onClick={() => open(3)}
            overlay={extraLabel}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {grid}
      {lightbox !== null && (
        <Lightbox photos={shown} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  )
}

// ── Gallery section label ─────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
      {children}
    </p>
  )
}

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-100 ${className}`} />
}

// ── Service row ───────────────────────────────────────────────────────────────
function ServiceRow({ service }) {
  const { name, duration_minutes, price, photo_url } = service
  return (
    <div className="group flex items-center gap-5 border-b border-neutral-100 py-5 last:border-0">
      {/* Photo or placeholder */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {photo_url ? (
          <img
            src={photo_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImagePlaceholder />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <p className="font-bold text-neutral-900 leading-snug">{name}</p>
          <p className="mt-1 text-xs text-neutral-400 tracking-wide">~{duration_minutes} min</p>
        </div>
        <p className="flex-shrink-0 text-xl font-black text-neutral-900">
          ${Number(price ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  )
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const score = Number(review.score ?? 0)
  const name  = review.client?.name || 'Cliente'
  const date  = fmtDate(review.createdAt || review.created_at)

  return (
    <div className="border-b border-neutral-100 py-5 last:border-0">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-black text-neutral-600">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-sm font-bold text-neutral-900 truncate">{name}</span>
            {date && <span className="flex-shrink-0 text-xs text-neutral-400">{date}</span>}
          </div>
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < Math.round(score) ? 'text-amber-400' : 'text-neutral-200'}>
                <StarFillIcon />
              </span>
            ))}
          </div>
          {review.comment && (
            <p className="text-sm leading-relaxed text-neutral-600">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Rating summary ────────────────────────────────────────────────────────────
function RatingSummary({ rating, reviewCount, reviews }) {
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(Number(r.score)) === star).length,
  }))

  return (
    <div className="flex gap-8 items-center pb-5 border-b border-neutral-100 mb-1">
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-5xl font-black text-neutral-900 leading-none">{rating.toFixed(1)}</span>
        <div className="flex gap-0.5 text-amber-400 mt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.round(rating) ? 'text-amber-400' : 'text-neutral-200'}>
              <StarFillIcon />
            </span>
          ))}
        </div>
        <span className="text-xs text-neutral-400 mt-0.5">{reviewCount} reseñas</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {dist.map(({ star, count }) => {
          const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2.5">
              <span className="w-3 text-right text-xs text-neutral-400">{star}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BusinessDetailPage() {
  const { businessId } = useParams()
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [businessId])

  const [business,   setBusiness]   = useState(null)
  const [services,   setServices]   = useState([])
  const [schedule,   setSchedule]   = useState([])
  const [reviews,    setReviews]    = useState([])
  const [loadingBiz, setLoadingBiz] = useState(true)
  const [loadingSvc, setLoadingSvc] = useState(true)
  const [loadingSch, setLoadingSch] = useState(true)
  const [loadingRev, setLoadingRev] = useState(true)

  useEffect(() => {
    let cancelled = false
    const safe = (set, done) => async (fn) => {
      try { const d = await fn(); if (!cancelled) set(d) }
      catch (_) {}
      finally { if (!cancelled) done(false) }
    }
    ;(async () => {
      try { const b = await getBusinessById(businessId); if (!cancelled) setBusiness(b) }
      catch (_) {}
      finally { if (!cancelled) setLoadingBiz(false) }
    })()
    safe(setServices, setLoadingSvc)(() => getBusinessServices(businessId))
    safe(setSchedule, setLoadingSch)(() => getBusinessSchedule(businessId))
    safe(setReviews,  setLoadingRev)(() => getBusinessReviews(businessId))
    return () => { cancelled = true }
  }, [businessId])

  if (loadingBiz) {
    return (
      <ClientLayout>
        <div className="animate-pulse space-y-0 pb-28">
          <Skeleton className="h-80 w-full rounded-none" />
          <div className="mt-0.5 grid grid-cols-3 gap-0.5">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-none" />)}
          </div>
          <div className="px-0 pt-8 space-y-5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </ClientLayout>
    )
  }

  if (!business) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-neutral-500">No encontramos este negocio.</p>
          <button type="button" onClick={() => navigate('/dashboard')}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors">
            Volver al inicio
          </button>
        </div>
      </ClientLayout>
    )
  }

  const cfg    = TYPE_CONFIG[business.type] ?? TYPE_CONFIG.other
  const groups = buildGroups(schedule)

  return (
    <ClientLayout>

      {/* ── Back ── */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-900"
      >
        <BackIcon /> Volver
      </button>

      {/* ── Gallery ── */}
      <div className="mb-8 -mx-5 sm:-mx-8">
        <PhotoGallery
          photos={business.photos}
          name={business.name}
          gradient={cfg.gradient}
        />
      </div>

      {/* ── Business identity ── */}
      <div className="mb-8 animate-slide-up">

        {/* Type + open/closed */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          {business.isOpen !== null && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${business.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${business.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
              {business.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black leading-tight text-neutral-900">
              {business.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <RatingStars value={business.rating} size="sm" />
              <span className="text-sm font-bold text-neutral-900">{business.rating.toFixed(1)}</span>
              <span className="text-sm text-neutral-400">({business.reviewCount} reseñas)</span>
            </div>
          </div>
          {/* Logo badge */}
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-14 w-14 flex-shrink-0 rounded-2xl object-cover border border-neutral-100 shadow-sm"
            />
          )}
        </div>

        {/* Contact */}
        <div className="flex flex-wrap gap-2">
          {business.location && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(business.location)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 shadow-sm"
            >
              <PinIcon />
              <span className="max-w-[160px] truncate">{business.location}</span>
              <ExternalIcon />
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 shadow-sm"
            >
              <PhoneIcon />
              {business.phone}
            </a>
          )}
        </div>
      </div>

      <div className="space-y-0 pb-32">

        {/* ── Services ── */}
        <section className="border-t border-neutral-100 pt-8 pb-2 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <SectionLabel>Servicios</SectionLabel>
          {loadingSvc ? (
            <div className="space-y-0">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-5 py-5 border-b border-neutral-100">
                  <Skeleton className="h-20 w-20 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <p className="py-6 text-sm text-neutral-400">No hay servicios disponibles.</p>
          ) : (
            <div>
              {services.map(s => <ServiceRow key={s.id} service={s} />)}
            </div>
          )}
        </section>

        {/* ── Schedule ── */}
        <section className="border-t border-neutral-100 pt-8 pb-2 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <SectionLabel>Horarios</SectionLabel>
          {loadingSch ? (
            <Skeleton className="h-36" />
          ) : schedule.length === 0 ? (
            <p className="py-6 text-sm text-neutral-400">Sin horarios disponibles.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {groups.map((g, i) => {
                const isToday = groupIsToday(g)
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-3.5 ${isToday ? 'text-emerald-700' : 'text-neutral-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isToday ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span className={`text-sm ${isToday ? 'font-bold' : 'font-medium'}`}>
                        {groupLabel(g)}
                        {isToday && <span className="ml-2 text-[11px] font-normal text-emerald-500">· hoy</span>}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold tabular-nums ${isToday ? 'text-emerald-700' : 'text-neutral-500'}`}>
                      {fmt12(g.start)} – {fmt12(g.end)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Map ── */}
        {(business.lat && business.lng) && (
          <section className="border-t border-neutral-100 pt-8 pb-2 animate-slide-up" style={{ animationDelay: '90ms' }}>
            <SectionLabel>Ubicación</SectionLabel>
            <BusinessMap lat={business.lat} lng={business.lng} type={business.type} name={business.name} />
          </section>
        )}

        {/* ── Reviews ── */}
        {!loadingRev && (reviews.length > 0 || business.reviewCount > 0) && (
          <section className="border-t border-neutral-100 pt-8 pb-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SectionLabel>Reseñas</SectionLabel>
            {loadingRev ? (
              <div className="space-y-4">
                <Skeleton className="h-24" /><Skeleton className="h-20" />
              </div>
            ) : reviews.length > 0 ? (
              <>
                <RatingSummary rating={business.rating} reviewCount={business.reviewCount} reviews={reviews} />
                <div>
                  {reviews.slice(0, 10).map((r, i) => <ReviewCard key={r.id ?? i} review={r} />)}
                </div>
              </>
            ) : null}
          </section>
        )}

      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-100 bg-white/95 backdrop-blur-md px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => navigate(`/booking/${business.id}`)}
            className={`w-full rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all duration-150 active:scale-[0.98] ${cfg.accent} hover:opacity-90`}
          >
            Reservar en {business.name}
          </button>
        </div>
      </div>

    </ClientLayout>
  )
}
