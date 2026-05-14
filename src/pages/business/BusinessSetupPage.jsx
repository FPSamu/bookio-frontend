import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { registerBusiness } from '../../services/businesses'

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'spa',        label: 'Spa' },
  { value: 'medical',    label: 'Médico' },
  { value: 'salon',      label: 'Salón' },
  { value: 'barbershop', label: 'Barbería' },
]

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e) => setPosition(e.target.getLatLng())
    }} />
  );
}

export default function BusinessSetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', type: 'restaurant', address: '' })
  const [position, setPosition] = useState({ lat: 20.676, lng: -103.347 }) // Default center (Guadalajara/Example)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre del negocio es requerido.')
      return
    }
    if (!position) {
      setError('Por favor selecciona la ubicación en el mapa.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await registerBusiness({ 
        name: form.name, 
        type: form.type, 
        address: form.address || undefined,
        lat: position.lat,
        lng: position.lng
      })
      navigate('/business/dashboard')
    } catch (err) {
      setError('No se pudo registrar el negocio. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* ── Left Side: Form ── */}
      <div className="w-full md:w-[450px] p-8 md:p-12 overflow-y-auto">
        <div className="mb-8">
          <span className="text-4xl font-black tracking-tight text-neutral-900 block mb-10">Bookio</span>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-neutral-300"></span>
            <span className="h-2 w-8 rounded-full bg-neutral-900"></span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Configura tu negocio</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ya casi terminas. Cuéntanos sobre tu negocio para que los clientes puedan encontrarte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-700">¿Qué tipo de negocio es?</span>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((t) => {
                const isActive = form.type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                    className={[
                      'rounded-full border px-4 py-2 text-xs font-bold transition-all duration-150',
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <InputField
            id="setup-name"
            label="Nombre del negocio"
            type="text"
            placeholder="Ej. Zen Garden Spa"
            value={form.name}
            onChange={set('name')}
            required
            className="py-3"
          />

          <InputField
            id="setup-address"
            label="Dirección completa"
            type="text"
            placeholder="Av. Presidente Masaryk 61, Polanco, CDMX"
            value={form.address}
            onChange={set('address')}
            className="py-3"
          />

          <div className="md:hidden">
             <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Ubicación en el mapa</p>
             <div className="h-48 rounded-2xl overflow-hidden border border-neutral-200">
                <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
             </div>
             <p className="mt-2 text-[10px] text-neutral-400 text-center">Toca el mapa para marcar tu ubicación exacta.</p>
          </div>

          <Button type="submit" fullWidth disabled={loading} className="mt-4 py-4 text-base font-bold shadow-xl shadow-neutral-900/10">
            {loading ? 'Guardando...' : 'Finalizar configuración'}
          </Button>
        </form>
      </div>

      {/* ── Right Side: Map (Desktop) ── */}
      <div className="hidden md:block flex-1 relative">
        <div className="absolute inset-0 z-0">
          <MapContainer center={[position.lat, position.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {/* Floating helper */}
        <div className="absolute bottom-10 left-10 z-[1000] max-w-xs rounded-2xl bg-white p-5 shadow-2xl border border-neutral-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-neutral-900 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <p className="text-sm font-bold text-neutral-900">Define tu ubicación</p>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Haz clic en el mapa o arrastra el marcador para indicar dónde se encuentra tu negocio. Esto ayudará a que tus clientes te encuentren fácilmente.
          </p>
        </div>
      </div>

    </div>
  )
}
