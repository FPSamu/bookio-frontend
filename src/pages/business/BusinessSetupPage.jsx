import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function BusinessSetupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', type: 'restaurant', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre del negocio es requerido.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await registerBusiness({ name: form.name, type: form.type, address: form.address || undefined })
      navigate('/business/dashboard')
    } catch (err) {
      setError('No se pudo registrar el negocio. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Registra tu negocio</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Completa los datos para empezar a recibir reservaciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Tipo de negocio</span>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((t) => {
                const isActive = form.type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                    className={[
                      'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white'
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
          />

          <InputField
            id="setup-address"
            label="Dirección"
            type="text"
            placeholder="Av. Presidente Masaryk 61, Polanco, CDMX"
            value={form.address}
            onChange={set('address')}
          />

          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? 'Registrando...' : 'Registrar negocio'}
          </Button>
        </form>
      </div>
    </div>
  )
}
