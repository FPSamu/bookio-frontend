import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ClientLayout from '../../layouts/ClientLayout'
import { getBusinesses } from '../../services/businesses'

// Fix Leaflet default icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TYPE_LABELS = {
  restaurant: 'Restaurante',
  spa: 'Spa',
  salon: 'Salón',
  medical: 'Médico',
  other: 'Otro',
}

function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 0.8 })
  }, [coords, map])
  return null
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="currentColor" className="text-amber-400" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function BusinessPanel({ business, onClose, onBook, onView }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-2xl border border-neutral-100 bg-white p-4 shadow-xl md:left-auto md:right-4 md:w-80">
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
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-2xl font-bold text-neutral-300">
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

export default function MapPage() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)

  const DEFAULT_CENTER = [20.6597, -103.3496] // Guadalajara

  useEffect(() => {
    getBusinesses({ limit: 200 })
      .then(({ businesses }) => setBusinesses(businesses.filter(b => b.lat && b.lng)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleMarkerClick(b) {
    setSelected(b)
    setFlyTarget([b.lat, b.lng])
  }

  return (
    <ClientLayout>
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mapa</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {loading ? 'Cargando negocios…' : `${businesses.length} negocios en el mapa`}
        </p>
      </section>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm" style={{ height: '65vh', minHeight: 360 }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {flyTarget && <FlyTo coords={flyTarget} />}

          {businesses.map(b => (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              eventHandlers={{ click: () => handleMarkerClick(b) }}
            >
              <Popup>
                <span className="font-semibold">{b.name}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

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
