import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BusinessLayout from '../../layouts/BusinessLayout'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { getMyBusiness } from '../../services/businesses'
import { createManualAppointment } from '../../services/appointments'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ManualAppointmentPage() {
  const navigate = useNavigate()

  const [business,  setBusiness]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const [serviceId,   setServiceId]   = useState('')
  const [clientName,  setClientName]  = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [date,        setDate]        = useState(today())
  const [time,        setTime]        = useState('09:00')
  const [errors,      setErrors]      = useState({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const biz = await getMyBusiness()
        if (!cancelled) {
          setBusiness(biz)
          if (biz.services?.length) setServiceId(biz.services[0].id)
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

  function validate() {
    const errs = {}
    if (!serviceId)       errs.serviceId   = 'Selecciona un servicio.'
    if (!clientName.trim()) errs.clientName = 'El nombre del cliente es requerido.'
    if (!date)            errs.date        = 'Selecciona una fecha.'
    if (!time)            errs.time        = 'Selecciona una hora.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setError('')
    setSaving(true)
    try {
      await createManualAppointment({
        businessId:    business.id,
        serviceId,
        startDatetime: `${date}T${time}:00`,
        clientName:    clientName.trim(),
        clientPhone:   clientPhone.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/business/reservations'), 1400)
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo crear la cita. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <BusinessLayout>
        <div className="animate-pulse space-y-4 max-w-lg">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-xl bg-neutral-100" />)}
        </div>
      </BusinessLayout>
    )
  }

  const services = business?.services ?? []

  return (
    <BusinessLayout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Cita manual</h1>
        <p className="mt-1 text-sm text-neutral-400">Registra una cita para un cliente que llega directamente.</p>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg" noValidate>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ¡Cita creada! Redirigiendo a reservaciones…
          </div>
        )}

        {/* Servicio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">
            Servicio <span className="text-red-500">*</span>
          </label>
          {services.length === 0 ? (
            <p className="text-sm text-neutral-400">No hay servicios disponibles. Agrega uno primero.</p>
          ) : (
            <select
              value={serviceId}
              onChange={(e) => { setServiceId(e.target.value); setErrors((p) => ({ ...p, serviceId: undefined })) }}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.duration_minutes} min · ${Number(s.price).toFixed(2)}
                </option>
              ))}
            </select>
          )}
          {errors.serviceId && <p className="text-xs text-red-500">{errors.serviceId}</p>}
        </div>

        {/* Cliente */}
        <InputField
          id="client-name"
          label="Nombre del cliente"
          placeholder="Nombre completo"
          value={clientName}
          onChange={(e) => { setClientName(e.target.value); setErrors((p) => ({ ...p, clientName: undefined })) }}
          error={errors.clientName}
          required
        />
        <InputField
          id="client-phone"
          label="Teléfono del cliente (opcional)"
          type="tel"
          placeholder="+52 55 1234 5678"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
        />

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={today()}
              onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })) }}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">
              Hora <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: undefined })) }}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
            {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={saving || services.length === 0}>
            {saving ? 'Creando…' : 'Crear cita'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </BusinessLayout>
  )
}
