import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ClientLayout from '../../layouts/ClientLayout'
import { getBusinesses } from '../../services/businesses'

// ── Constants ────────────────────────────────────────────────────────────────
const ACCENT_COLORS = {
  restaurant: '#f97316', spa: '#10b981', salon: '#8b5cf6',
  barbershop: '#f59e0b', medical: '#0ea5e9', other: '#737373',
}

const RADIUS_STEPS = [1, 2, 5, 10, 20, 50]

const TYPE_LABELS = {
  restaurant: 'Restaurante', spa: 'Spa', salon: 'Salón',
  barbershop: 'Barbería', medical: 'Médico', other: 'Otro',
}

const DEFAULT_CENTER = [19.4326, -99.1332]

// ── Map icons ────────────────────────────────────────────────────────────────
function buildBusinessIcon(type, active = false) {
  const color = ACCENT_COLORS[type] ?? '#737373'
  const w = active ? 40 : 32
  const h = active ? 52 : 42
  return L.divIcon({
    className: '',
    html: `<svg width="${w}" height="${h}" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.059 0 0 8.059 0 18C0 30 18 46 18 46C18 46 36 30 36 18C36 8.059 27.941 0 18 0Z" fill="${color}"/>
      <circle cx="18" cy="18" r="7.5" fill="white"/>
    </svg>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h - 4],
  })
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:26px;height:26px">
    <div style="position:absolute;inset:-7px;border-radius:50%;background:rgba(16,185,129,0.2);animation:gpulse 2s ease-in-out infinite"></div>
    <div style="position:absolute;inset:0;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 2px rgba(16,185,129,0.3),0 2px 10px rgba(0,0,0,0.2)"></div>
    <style>@keyframes gpulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(2.4);opacity:0}}</style>
  </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Inner map controller ──────────────────────────────────────────────────────
function FlyTo({ coords, zoom = 14 }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, zoom, { duration: 1.2 })
  }, [coords, map])
  return null
}

// ── Icons ────────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="currentColor" className="text-amber-400">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function LocateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </svg>
  )
}

// ── Business info panel ──────────────────────────────────────────────────────
function BusinessPanel({ business, onClose, onView, onBook }) {
  return (
    <div className="absolute bottom-[72px] left-3 right-3 z-[1000] rounded-2xl border border-neutral-100 bg-white/98 p-4 shadow-2xl backdrop-blur-sm md:bottom-4 md:left-auto md:right-4 md:w-80">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
        aria-label="Cerrar"
      >
        <CloseIcon />
      </button>

      <div className="flex gap-3 pr-8">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-xl font-black text-white"
            style={{ background: ACCENT_COLORS[business.type] ?? '#737373' }}
          >
            {business.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-neutral-900">{business.name}</h3>
          <p className="text-xs text-neutral-500">{TYPE_LABELS[business.type] || business.type}</p>
          {business.rating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <StarIcon />
              <span className="text-xs font-semibold text-neutral-700">{business.rating.toFixed(1)}</span>
              {business.reviewCount > 0 && (
                <span className="text-xs text-neutral-400">({business.reviewCount})</span>
              )}
            </div>
          )}
          {business.location && (
            <p className="mt-0.5 truncate text-xs text-neutral-400">{business.location}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-full border border-neutral-200 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Ver detalles
        </button>
        <button
          type="button"
          onClick={onBook}
          className="flex-1 rounded-full bg-neutral-900 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          Reservar
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate()
  const [allBusinesses, setAllBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locErr, setLocErr] = useState(null)
  const [radiusStep, setRadiusStep] = useState(2) // default: 5 km

  const radius = RADIUS_STEPS[radiusStep]
  const DEFAULT_CENTER = [20.6597, -103.3496] // Guadalajara

  useEffect(() => {
    getBusinesses({ limit: 200 })
      .then(({ businesses }) => setAllBusinesses(businesses.filter(b => b.lat && b.lng)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visibleBusinesses = userPos
    ? allBusinesses.filter(b => haversine(userPos[0], userPos[1], b.lat, b.lng) <= radius)
    : allBusinesses

  const inRangeCount = userPos ? visibleBusinesses.length : null

  function handleLocate() {
    setLocating(true)
    setLocErr(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = [coords.latitude, coords.longitude]
        setUserPos(pos)
        setFlyTarget(pos)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocErr('No se pudo obtener tu ubicación')
      },
    )
  }

  function handleMarkerClick(b) {
    setSelected(b)
    setFlyTarget([b.lat, b.lng])
  }

  return (
    <ClientLayout>
      <section className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Mapa</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {loading
            ? 'Cargando negocios…'
            : userPos
              ? `${inRangeCount} negocio${inRangeCount !== 1 ? 's' : ''} en ${radius} km · ${allBusinesses.length} total`
              : `${allBusinesses.length} negocios en el mapa`}
        </p>
      </section>

      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm"
        style={{ height: '66vh', minHeight: 420, isolation: 'isolate' }}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />

          {flyTarget && <FlyTo coords={flyTarget} />}

          {/* Radius circle around user */}
          {userPos && (
            <Circle
              center={userPos}
              radius={radius * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.07,
                weight: 2,
                dashArray: '7 5',
              }}
            />
          )}

          {/* Business markers */}
          {visibleBusinesses.map(b => (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              icon={buildBusinessIcon(b.type, selected?.id === b.id)}
              eventHandlers={{ click: () => handleMarkerClick(b) }}
            />
          ))}

          {/* User location dot */}
          {userPos && <Marker position={userPos} icon={USER_ICON} />}
        </MapContainer>

        {/* ── Bottom controls bar ── */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] flex items-center justify-between gap-2">

          {/* Radius +/- control */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-neutral-100 bg-white/96 px-2 py-1.5 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRadiusStep(s => Math.max(0, s - 1))}
              disabled={radiusStep === 0}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-lg font-black text-neutral-800 transition-colors hover:bg-neutral-200 disabled:opacity-30"
            >
              −
            </button>
            <div className="min-w-[60px] px-1 text-center">
              <p className="text-sm font-black leading-tight tabular-nums text-neutral-900">{radius} km</p>
              {inRangeCount !== null ? (
                <p className="text-[10px] font-semibold leading-tight text-emerald-600">{inRangeCount} cerca</p>
              ) : (
                <p className="text-[10px] leading-tight text-neutral-400">radio</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setRadiusStep(s => Math.min(RADIUS_STEPS.length - 1, s + 1))}
              disabled={radiusStep === RADIUS_STEPS.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-lg font-black text-neutral-800 transition-colors hover:bg-neutral-200 disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Locate me button */}
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-neutral-100 bg-white/96 px-4 py-2.5 shadow-lg backdrop-blur-sm text-sm font-semibold text-neutral-800 transition-all hover:bg-white active:scale-[0.97] disabled:opacity-60"
          >
            {locating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 flex-shrink-0" />
                <span className="text-xs">Localizando…</span>
              </>
            ) : userPos ? (
              <>
                <span className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs">Ubicado</span>
              </>
            ) : (
              <>
                <LocateIcon />
                <span className="text-xs">Ver donde estoy</span>
              </>
            )}
          </button>
        </div>

        {/* Location error toast */}
        {locErr && (
          <div className="absolute bottom-16 left-1/2 z-[1001] -translate-x-1/2 whitespace-nowrap rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 shadow-md">
            {locErr}
          </div>
        )}

        {/* Business info panel */}
        {selected && (
          <BusinessPanel
            business={selected}
            onClose={() => setSelected(null)}
            onView={() => navigate(`/business/${selected.id}`)}
            onBook={() => navigate(`/booking/${selected.id}`)}
          />
        )}
      </div>
    </ClientLayout>
  )
}
