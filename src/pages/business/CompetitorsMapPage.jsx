import { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BusinessLayout from '../../layouts/BusinessLayout'
import { getBusinesses, getMyBusiness, getBusinessServices } from '../../services/businesses'

// ── Haversine distance (km) ───────────────────────────────────────────────────

function haversine(lat1, lng1, lat2, lng2) {
  const R  = 6371
  const dL = ((lat2 - lat1) * Math.PI) / 180
  const dG = ((lng2 - lng1) * Math.PI) / 180
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dG / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Pin factory ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  restaurant: '#f97316',
  spa:        '#8b5cf6',
  salon:      '#ec4899',
  barbershop: '#f59e0b',
  medical:    '#0ea5e9',
  other:      '#6b7280',
}

function makePin(color, isMine = false) {
  const size  = isMine ? 38 : 30
  const inner = isMine ? 8 : 6
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size+8}px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.25))">
      <div style="width:${size}px;height:${size}px;background:${isMine?'#171717':color};border:${isMine?'3px solid white':'2.5px solid white'};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center">
        <div style="width:${inner}px;height:${inner}px;background:white;border-radius:50%;transform:rotate(45deg)"></div>
      </div>
    </div>`,
    iconSize:   [size, size + 8],
    iconAnchor: [size / 2, size + 8],
  })
}

// ── Star bar ──────────────────────────────────────────────────────────────────

function StarBar({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <svg key={n} width="10" height="10" viewBox="0 0 24 24"
            fill={n <= Math.round(rating) ? '#fbbf24' : 'none'}
            stroke={n <= Math.round(rating) ? '#fbbf24' : '#d1d5db'}
            strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] font-semibold text-neutral-600">{rating.toFixed(1)}</span>
    </div>
  )
}

function MapFlyTo({ position }) {
  const map  = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (position && !done.current) {
      map.setView(position, 14, { animate: true })
      done.current = true
    }
  }, [position, map])
  return null
}

const TYPE_LABEL = {
  restaurant: 'Restaurante', spa: 'Spa', salon: 'Salón',
  barbershop: 'Barbería', medical: 'Médico', other: 'Otro',
}
const KM_OPTIONS = [1, 3, 5, 10, 25, 50]

// ── Empty state — magnifying glass icon ──────────────────────────────────────

function EmptyCompetitors({ radiusKm, onExpand }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      {/* Magnifying glass with glasses */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          className="text-neutral-400">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          {/* lenses */}
          <path d="M8 11a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0" />
          <path d="M11 11h1" />
          <path d="M12 11a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0" />
          {/* frame bridge */}
          <path d="M7 11h1M15 11h1" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-neutral-600">
          Sin competidores en {radiusKm} km
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          Amplia el rango para explorar más
        </p>
      </div>
      {radiusKm < 50 && (
        <button type="button" onClick={onExpand}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors">
          Ampliar rango
        </button>
      )}
    </div>
  )
}

// ── Sidebar card ──────────────────────────────────────────────────────────────

function BusinessCard({ biz, isMine, selected, onClick }) {
  const color = TYPE_COLORS[biz.type] ?? TYPE_COLORS.other
  return (
    <button type="button" onClick={() => onClick(biz)}
      className={[
        'w-full rounded-xl border p-3 text-left transition-all duration-150',
        selected
          ? 'border-neutral-900 bg-neutral-50 shadow-sm'
          : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50',
      ].join(' ')}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ background: isMine ? '#171717' : color }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-bold text-neutral-900">{biz.name}</p>
            {isMine && (
              <span className="flex-shrink-0 rounded-full bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold text-white">Tú</span>
            )}
          </div>
          <p className="text-[10px] capitalize text-neutral-400">{TYPE_LABEL[biz.type] ?? biz.type}</p>
          {biz.rating > 0 && <StarBar rating={biz.rating} />}
        </div>
      </div>
    </button>
  )
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────────

function MobileSheet({ selected, services, loadingSvc, myLat, myLng, myPos, onClose }) {
  const open = !!selected
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div className={[
        'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden',
        open ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')} style={{ maxHeight: '65vh' }}>

        {/* Handle */}
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        <div className="overflow-y-auto px-4 pb-8 pt-1" style={{ maxHeight: 'calc(65vh - 28px)' }}>
          {selected && (
            <>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-900">{selected.name}</p>
                  <p className="text-xs capitalize text-neutral-400">{TYPE_LABEL[selected.type] ?? selected.type}</p>
                  {selected.rating > 0 && <StarBar rating={selected.rating} />}
                  {myPos && (
                    <p className="mt-0.5 text-[10px] text-neutral-400">
                      A {haversine(myLat, myLng, selected.lat, selected.lng).toFixed(1)} km de ti
                    </p>
                  )}
                </div>
                <button type="button" onClick={onClose}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Servicios</p>
              {loadingSvc ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded-lg bg-neutral-100" />)}
                </div>
              ) : services.length === 0 ? (
                <p className="text-xs text-neutral-400">Sin servicios registrados.</p>
              ) : (
                <div className="space-y-1.5">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                      <span className="text-xs font-semibold text-neutral-800 truncate">{s.name}</span>
                      <div className="ml-2 flex-shrink-0 text-right">
                        <p className="text-xs font-bold text-neutral-900">
                          ${Number(s.price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-neutral-400">{s.duration_minutes} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompetitorsMapPage() {
  const [myBiz,      setMyBiz]      = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [selected,   setSelected]   = useState(null)
  const [services,   setServices]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadingSvc, setLoadingSvc] = useState(false)
  const [filter,     setFilter]     = useState('all')
  const [radiusKm,   setRadiusKm]   = useState(10)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [{ businesses: all }, mine] = await Promise.all([
          getBusinesses({ limit: 200 }),
          getMyBusiness(),
        ])
        if (cancelled) return
        setMyBiz(mine)
        setBusinesses(all)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoadingSvc(true)
    setServices([])
    getBusinessServices(selected.id)
      .then(s => { if (!cancelled) setServices(s) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingSvc(false) })
    return () => { cancelled = true }
  }, [selected])

  const myLat = myBiz?.latitude ?? myBiz?.lat ?? null
  const myLng = myBiz?.longitude ?? myBiz?.lng ?? null
  const myPos = myLat && myLng ? [myLat, myLng] : null
  const defaultCenter = myPos ?? [20.676, -103.347]

  const withCoords = businesses.filter(b => b.lat && b.lng && b.id !== myBiz?.id)

  const filtered = useMemo(() => {
    return withCoords.filter(b => {
      const typeOk = filter === 'all' || b.type === myBiz?.type?.toLowerCase?.()
      const distOk = myPos ? haversine(myLat, myLng, b.lat, b.lng) <= radiusKm : true
      return typeOk && distOk
    })
  }, [withCoords, filter, radiusKm, myPos, myLat, myLng, myBiz]) // eslint-disable-line

  function expandRadius() {
    const idx = KM_OPTIONS.indexOf(radiusKm)
    setRadiusKm(KM_OPTIONS[Math.min(idx + 1, KM_OPTIONS.length - 1)])
  }

  return (
    <BusinessLayout>

      {/* Header */}
      <section className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Mapa de competencia</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Explora negocios cercanos, sus servicios y calificaciones.
        </p>
      </section>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { id: 'all',  label: 'Todos' },
          { id: 'same', label: `Solo ${TYPE_LABEL[myBiz?.type?.toLowerCase?.()] ?? 'mi tipo'}` },
        ].map(t => (
          <button key={t.id} type="button" onClick={() => setFilter(t.id)}
            className={[
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === t.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
            ].join(' ')}>
            {t.label}
          </button>
        ))}

        {/* Radius */}
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-neutral-400">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <select value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}
            className="bg-transparent text-xs font-semibold text-neutral-700 outline-none cursor-pointer">
            {KM_OPTIONS.map(km => (
              <option key={km} value={km}>{km} km</option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-xs text-neutral-400">
          {filtered.length} en rango
        </span>
      </div>

      {/* ── Desktop: map + sidebar ── Mobile: full-height map + bottom sheet ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

        {/* Map — full height on mobile */}
        <div
          className="overflow-hidden rounded-2xl border border-neutral-100 shadow-sm lg:flex-1"
          style={{ height: 'calc(100svh - 260px)', minHeight: 320 }}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center bg-neutral-50">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
            </div>
          ) : (
            <MapContainer center={defaultCenter} zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl attributionControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <MapFlyTo position={myPos} />

              {/* Radius circle */}
              {myPos && (
                <Circle center={myPos} radius={radiusKm * 1000}
                  pathOptions={{ color: '#171717', weight: 1, opacity: 0.25, fillOpacity: 0.04 }} />
              )}

              {/* My pin */}
              {myPos && (
                <Marker position={myPos} icon={makePin('#171717', true)}>
                  <Popup>
                    <div className="min-w-[120px]">
                      <p className="text-xs font-bold text-neutral-900">{myBiz?.name ?? 'Mi negocio'}</p>
                      <span className="inline-block mt-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[9px] font-bold text-white">
                        Estamos aquí
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Competitor pins — popup: name + type only */}
              {filtered.map(b => (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={makePin(TYPE_COLORS[b.type] ?? TYPE_COLORS.other)}
                  eventHandlers={{ click: () => setSelected(b) }}
                >
                  <Popup>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{b.name}</p>
                      <p className="text-[11px] capitalize text-neutral-400">{TYPE_LABEL[b.type] ?? b.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <div className="hidden lg:flex lg:w-72 flex-col gap-3">

          {/* Selected detail */}
          {selected ? (
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-900">{selected.name}</p>
                  <p className="text-xs capitalize text-neutral-400">{TYPE_LABEL[selected.type] ?? selected.type}</p>
                  {selected.rating > 0 && <StarBar rating={selected.rating} />}
                  {myPos && (
                    <p className="mt-0.5 text-[10px] text-neutral-400">
                      A {haversine(myLat, myLng, selected.lat, selected.lng).toFixed(1)} km de ti
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {selected.location && (
                <p className="mb-3 text-[11px] text-neutral-400">{selected.location}</p>
              )}

              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Servicios</p>
              {loadingSvc ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded-lg bg-neutral-100" />)}
                </div>
              ) : services.length === 0 ? (
                <p className="text-xs text-neutral-400">Sin servicios registrados.</p>
              ) : (
                <div className="space-y-1.5">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                      <span className="text-xs font-semibold text-neutral-800 truncate">{s.name}</span>
                      <div className="ml-2 flex-shrink-0 text-right">
                        <p className="text-xs font-bold text-neutral-900">
                          ${Number(s.price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] text-neutral-400">{s.duration_minutes} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="mx-auto mb-2 text-neutral-300">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="text-xs text-neutral-400">Toca un pin para ver sus detalles</p>
            </div>
          )}

          {/* List */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm">
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              En rango · {radiusKm} km ({filtered.length})
            </p>

            {myBiz && myPos && (
              <div className="mb-1.5">
                <BusinessCard
                  biz={{ ...myBiz, type: myBiz.type?.toLowerCase?.() ?? 'other', lat: myLat, lng: myLng, rating: myBiz.average_rating ?? 0 }}
                  isMine selected={false} onClick={() => {}} />
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyCompetitors radiusKm={radiusKm} onExpand={expandRadius} />
            ) : (
              <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-0.5">
                {filtered.map(b => (
                  <BusinessCard key={b.id} biz={b} isMine={false}
                    selected={selected?.id === b.id} onClick={setSelected} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: bottom sheet ── */}
      <MobileSheet
        selected={selected}
        services={services}
        loadingSvc={loadingSvc}
        myLat={myLat}
        myLng={myLng}
        myPos={myPos}
        onClose={() => setSelected(null)}
      />

    </BusinessLayout>
  )
}
