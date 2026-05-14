import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BusinessLayout from '../../layouts/BusinessLayout'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { getMyBusiness, updateBusiness, uploadBusinessLogo, uploadBusinessPhotos } from '../../services/businesses'

// ── Constants ─────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'spa',        label: 'Spa'         },
  { value: 'salon',      label: 'Salón'       },
  { value: 'barbershop', label: 'Barbería'    },
  { value: 'medical',    label: 'Médico'      },
  { value: 'other',      label: 'Otro'        },
]

const BACKEND_TO_FRONTEND = {
  RESTAURANT: 'restaurant', SPA: 'spa', SALON: 'salon',
  BARBERSHOP: 'barbershop', MEDICAL: 'medical', OTHER: 'other',
}

// ── Map pin icon (divIcon avoids Vite asset issues with default Leaflet icons) ─

const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16C0 27 16 42 16 42C16 42 32 27 32 16C32 7.163 24.837 0 16 0Z" fill="#171717"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
})

// ── Map sub-components ────────────────────────────────────────────────────────

/** Listens for map clicks and renders a draggable marker */
function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng])
    },
  })

  if (!position) return null

  return (
    <Marker
      position={position}
      icon={PIN_ICON}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng()
          onPositionChange([lat, lng])
        },
      }}
    />
  )
}

/** Centers the map on the initial position once on mount */
function MapCenterController({ position }) {
  const map = useMapEvents({})
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ── Photo sub-components ──────────────────────────────────────────────────────

function PhotoPreview({ src, onRemove }) {
  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200">
      <img src={src} alt="preview" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

function AddPhotoButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span className="text-xs">Foto</span>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditBusinessPage() {
  const navigate = useNavigate()
  const logoInputRef   = useRef(null)
  const photosInputRef = useRef(null)

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // Form fields
  const [name,    setName]    = useState('')
  const [type,    setType]    = useState('other')
  const [address, setAddress] = useState('')
  const [phone,   setPhone]   = useState('')

  // Location  [lat, lng] | null
  const [mapPosition, setMapPosition] = useState(null)
  const [locating,    setLocating]    = useState(false)

  // Logo
  const [logoUrl,     setLogoUrl]     = useState(null)
  const [logoFile,    setLogoFile]    = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Gallery photos
  const [existingPhotos,   setExistingPhotos]   = useState([])
  const [newPhotoFiles,    setNewPhotoFiles]     = useState([])
  const [newPhotoPreviews, setNewPhotoPreviews]  = useState([])

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const biz = await getMyBusiness()
        if (cancelled) return
        setName(biz.name || '')
        setType(BACKEND_TO_FRONTEND[biz.type] || 'other')
        setAddress(biz.address || '')
        setPhone(biz.phone || '')
        setLogoUrl(biz.logo_url || null)
        setExistingPhotos(Array.isArray(biz.photos) ? biz.photos : [])
        if (biz.latitude && biz.longitude) {
          setMapPosition([Number(biz.latitude), Number(biz.longitude)])
        }
      } catch {
        setError('No se pudo cargar la información del negocio.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handlePhotosChange(e) {
    const files = Array.from(e.target.files || [])
    const remaining = 4 - existingPhotos.length - newPhotoFiles.length
    const toAdd = files.slice(0, remaining)
    setNewPhotoFiles((prev) => [...prev, ...toAdd])
    setNewPhotoPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
  }

  function removeExistingPhoto(idx) {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  function removeNewPhoto(idx) {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== idx))
    setNewPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMapPosition([coords.latitude, coords.longitude])
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError('')
    setSaving(true)
    try {
      await updateBusiness({
        name:      name.trim(),
        type,
        address:   address.trim(),
        phone:     phone.trim(),
        photos:    existingPhotos,
        latitude:  mapPosition ? mapPosition[0] : undefined,
        longitude: mapPosition ? mapPosition[1] : undefined,
      })
      if (logoFile) await uploadBusinessLogo(logoFile)
      if (newPhotoFiles.length > 0) await uploadBusinessPhotos(newPhotoFiles)
      setSuccess(true)
      setTimeout(() => navigate('/business/dashboard'), 1200)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalPhotos  = existingPhotos.length + newPhotoFiles.length
  const defaultCenter = mapPosition ?? [20.676, -103.347] // Default: Guadalajara

  // ── Skeleton ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <BusinessLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-neutral-100" />
          <div className="h-12 rounded-xl bg-neutral-100" />
          <div className="h-12 rounded-xl bg-neutral-100" />
          <div className="h-12 rounded-xl bg-neutral-100" />
        </div>
      </BusinessLayout>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <BusinessLayout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Editar negocio</h1>
        <p className="mt-1 text-sm text-neutral-400">Actualiza la información de tu negocio.</p>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl" noValidate>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ¡Cambios guardados! Redirigiendo…
          </div>
        )}

        {/* ── Información básica ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-neutral-900">Información del negocio</h2>

          <InputField id="biz-name" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Tipo de negocio</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <InputField id="biz-address" label="Dirección (texto)" value={address} onChange={(e) => setAddress(e.target.value)} />
          <InputField id="biz-phone" label="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {/* ── Ubicación en el mapa ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Ubicación en el mapa</h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Haz clic en el mapa o arrastra el pin para ajustar la posición.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {locating ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                </svg>
              )}
              Mi ubicación
            </button>
          </div>

          {mapPosition && (
            <p className="text-[11px] font-mono text-neutral-400">
              {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-neutral-100 shadow-sm" style={{ height: 280 }}>
            <MapContainer
              center={defaultCenter}
              zoom={mapPosition ? 15 : 12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; CARTO"
              />
              <MapCenterController position={mapPosition} />
              <LocationPicker position={mapPosition} onPositionChange={setMapPosition} />
            </MapContainer>
          </div>

          {!mapPosition && (
            <p className="text-center text-xs text-neutral-400">
              Toca el mapa para colocar el pin de tu negocio.
            </p>
          )}
        </div>

        {/* ── Logo ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-neutral-900">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 flex-shrink-0">
              {(logoPreview || logoUrl) ? (
                <img src={logoPreview || logoUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                {logoUrl || logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </button>
              <p className="mt-1 text-xs text-neutral-400">JPG, PNG · Recomendado: 400×400 px</p>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        {/* ── Galería ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Fotos del negocio</h2>
            <span className="text-xs text-neutral-400">{totalPhotos}/4</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {existingPhotos.map((url, i) => (
              <PhotoPreview key={`existing-${i}`} src={url} onRemove={() => removeExistingPhoto(i)} />
            ))}
            {newPhotoPreviews.map((src, i) => (
              <PhotoPreview key={`new-${i}`} src={src} onRemove={() => removeNewPhoto(i)} />
            ))}
            {totalPhotos < 4 && (
              <AddPhotoButton onClick={() => photosInputRef.current?.click()} />
            )}
          </div>
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotosChange}
          />
        </div>

        {/* ── Acciones ── */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </BusinessLayout>
  )
}
