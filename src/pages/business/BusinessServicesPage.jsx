import { useState, useEffect, useCallback } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import SectionTitle from '../../components/ui/SectionTitle'
import Button from '../../components/ui/Button'
import InputField from '../../components/ui/InputField'
import { getMyBusiness } from '../../services/businesses'
import {
  createService,
  getServiceSchedule,
  upsertServiceScheduleDay,
  removeServiceScheduleDay,
} from '../../services/services'

// ── Constantes ────────────────────────────────────────────────────────────────

const DAYS = [
  { dow: 1, label: 'Lunes' },
  { dow: 2, label: 'Martes' },
  { dow: 3, label: 'Miércoles' },
  { dow: 4, label: 'Jueves' },
  { dow: 5, label: 'Viernes' },
  { dow: 6, label: 'Sábado' },
  { dow: 0, label: 'Domingo' },
]

const TYPE_CONFIG = {
  RESTAURANT: {
    namePlaceholder: 'Mesa interior',
    durationPlaceholder: '90',
    suggestions: ['Mesa interior', 'Mesa terraza', 'Salón privado', 'Barra', 'Mesa exterior'],
    durations: [60, 90, 120],
  },
  MEDICAL: {
    namePlaceholder: 'Consulta general',
    durationPlaceholder: '30',
    suggestions: ['Consulta general', 'Consulta de seguimiento', 'Revisión', 'Limpieza dental', 'Análisis de laboratorio', 'Radiografía'],
    durations: [20, 30, 45, 60],
  },
  SPA: {
    namePlaceholder: 'Masaje de relajación 60 min',
    durationPlaceholder: '60',
    suggestions: ['Masaje de relajación', 'Masaje deportivo', 'Facial hidratante', 'Aromaterapia', 'Exfoliación corporal'],
    durations: [30, 60, 90],
  },
  SALON: {
    namePlaceholder: 'Corte de cabello',
    durationPlaceholder: '45',
    suggestions: ['Corte de cabello', 'Coloración', 'Balayage', 'Peinado', 'Alisado', 'Tratamiento capilar'],
    durations: [30, 45, 60, 90],
  },
  BARBERSHOP: {
    namePlaceholder: 'Corte clásico',
    durationPlaceholder: '30',
    suggestions: ['Corte clásico', 'Corte y barba', 'Afeitado', 'Arreglo de barba', 'Delineado'],
    durations: [20, 30, 45],
  },
  OTHER: {
    namePlaceholder: 'Nombre del servicio',
    durationPlaceholder: '60',
    suggestions: [],
    durations: [30, 60, 90],
  },
}

const DEFAULT_CONFIG = TYPE_CONFIG.OTHER

// ── Chips ─────────────────────────────────────────────────────────────────────

function ChipGroup({ options, active, onSelect, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={[
            'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
            active === opt
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
        checked ? 'bg-neutral-900' : 'bg-neutral-200',
      ].join(' ')}
    >
      <span className={[
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      ].join(' ')} />
    </button>
  )
}

// ── Fila de día en el horario del servicio ────────────────────────────────────

function ServiceDayRow({ dow, label, schedule, serviceId, onSaved, onRemoved }) {
  const isOpen = !!schedule
  const [start,   setStart]   = useState(schedule?.start_time ?? '09:00')
  const [end,     setEnd]     = useState(schedule?.end_time   ?? '18:00')
  const [dirty,   setDirty]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const handleToggle = async (open) => {
    if (!open && schedule) {
      setSaving(true)
      try { await removeServiceScheduleDay(serviceId, schedule.id); onRemoved(schedule.id) }
      catch { setError('Error al guardar') }
      finally { setSaving(false) }
    }
    if (open && !schedule) {
      setSaving(true)
      try {
        const saved = await upsertServiceScheduleDay(serviceId, { dayOfWeek: dow, startTime: start, endTime: end })
        onSaved(saved)
        setDirty(false)
      }
      catch { setError('Error al guardar') }
      finally { setSaving(false) }
    }
  }

  const handleSave = async () => {
    if (start >= end) { setError('La hora de apertura debe ser antes del cierre'); return }
    setError('')
    setSaving(true)
    try {
      const saved = await upsertServiceScheduleDay(serviceId, { dayOfWeek: dow, startTime: start, endTime: end })
      onSaved(saved)
      setDirty(false)
    }
    catch { setError('Error al guardar') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <Toggle checked={isOpen} onChange={handleToggle} />
        <span className="w-20 text-xs font-medium text-neutral-700">{label}</span>

        {isOpen && (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => { setStart(e.target.value); setDirty(true) }}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <span className="text-xs text-neutral-400">a</span>
            <input
              type="time"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setDirty(true) }}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                {saving ? '…' : 'Guardar'}
              </button>
            )}
          </div>
        )}

        {!isOpen && <span className="text-xs text-neutral-400">No disponible</span>}
      </div>
      {error && <p className="text-xs text-red-500 pl-12">{error}</p>}
    </div>
  )
}

// ── Editor de horario del servicio ────────────────────────────────────────────

function ServiceScheduleEditor({ serviceId }) {
  const [scheduleMap,   setScheduleMap]   = useState(null)  // null = no cargado
  const [loading,       setLoading]       = useState(true)
  const [customActive,  setCustomActive]  = useState(false)
  const [resetting,     setResetting]     = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getServiceSchedule(serviceId)
      .then((schedules) => {
        if (cancelled) return
        const map = {}
        schedules.forEach((s) => { map[s.day_of_week] = s })
        setScheduleMap(map)
        setCustomActive(schedules.length > 0)
      })
      .catch(() => { if (!cancelled) setScheduleMap({}) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [serviceId])

  const handleActivate = () => {
    setCustomActive(true)
    if (scheduleMap === null) setScheduleMap({})
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const ids = Object.values(scheduleMap).map((s) => s.id)
      await Promise.all(ids.map((dayId) => removeServiceScheduleDay(serviceId, dayId)))
      setScheduleMap({})
      setCustomActive(false)
    } catch {
      // noop
    } finally {
      setResetting(false)
    }
  }

  const handleSaved = useCallback((saved) => {
    setScheduleMap((prev) => ({ ...prev, [saved.day_of_week]: saved }))
  }, [])

  const handleRemoved = useCallback((dayId) => {
    setScheduleMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((dow) => {
        if (next[dow]?.id === dayId) delete next[dow]
      })
      return next
    })
  }, [])

  if (loading) {
    return <div className="h-5 w-32 animate-pulse rounded bg-neutral-100" />
  }

  if (!customActive) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">
          Este servicio usa el horario general del negocio.
        </p>
        <button
          type="button"
          onClick={handleActivate}
          className="flex-shrink-0 text-xs font-semibold text-neutral-900 hover:underline"
        >
          Personalizar horario
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-neutral-700">
          Horario específico
          <span className="ml-1.5 font-normal text-neutral-400">
            — los días desactivados no estarán disponibles para este servicio
          </span>
        </p>
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="flex-shrink-0 text-xs text-neutral-400 hover:text-red-500 disabled:opacity-40"
        >
          {resetting ? '…' : 'Usar horario del negocio'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {DAYS.map(({ dow, label }) => (
          <ServiceDayRow
            key={dow}
            dow={dow}
            label={label}
            schedule={scheduleMap[dow] ?? null}
            serviceId={serviceId}
            onSaved={handleSaved}
            onRemoved={handleRemoved}
          />
        ))}
      </div>
    </div>
  )
}

// ── Chevron ───────────────────────────────────────────────────────────────────

function ChevronIcon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Tarjeta de servicio ───────────────────────────────────────────────────────

function ServiceCard({ service }) {
  const { id, name, duration_minutes, price } = service
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-sm font-semibold text-neutral-900">{name}</span>
          <span className="text-xs text-neutral-400">~{duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold text-neutral-900">
            ${Number(price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
          </span>
          <ChevronIcon open={expanded} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4">
          <ServiceScheduleEditor serviceId={id} />
        </div>
      )}
    </div>
  )
}

// ── Formulario de nuevo servicio ──────────────────────────────────────────────

function ServiceForm({ businessType, onCreated, onCancel }) {
  const config = TYPE_CONFIG[businessType] ?? DEFAULT_CONFIG

  const [form,     setForm]     = useState({ name: '', duration: '', price: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const setName     = useCallback((name)     => setForm((p) => ({ ...p, name })),                          [])
  const setDuration = useCallback((duration) => setForm((p) => ({ ...p, duration: String(duration) })), [])

  function validate() {
    const errs = {}
    if (!form.name.trim())                           errs.name     = 'El nombre es requerido.'
    if (!form.duration || Number(form.duration) < 1) errs.duration = 'Ingresa una duración válida.'
    if (form.price === '' || Number(form.price) < 0) errs.price    = 'Ingresa un precio válido.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      const service = await createService({
        name:            form.name.trim(),
        durationMinutes: Number(form.duration),
        price:           Number(form.price),
      })
      onCreated(service)
    } catch {
      setApiError('No se pudo crear el servicio. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
      noValidate
    >
      <p className="text-sm font-semibold text-neutral-700">Nuevo servicio</p>

      {apiError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p>
      )}

      {config.suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Sugerencias</span>
          <ChipGroup options={config.suggestions} active={form.name} onSelect={setName} />
        </div>
      )}

      <InputField
        id="svc-name"
        label="Nombre del servicio"
        placeholder={config.namePlaceholder}
        value={form.name}
        onChange={setField('name')}
        error={errors.name}
        required
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-500">Duración rápida</span>
        <ChipGroup
          options={config.durations.map((d) => `${d} min`)}
          active={form.duration ? `${form.duration} min` : ''}
          onSelect={(opt) => setDuration(parseInt(opt))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          id="svc-duration"
          label="Duración (min)"
          type="number"
          placeholder={config.durationPlaceholder}
          value={form.duration}
          onChange={setField('duration')}
          error={errors.duration}
          required
        />
        <InputField
          id="svc-price"
          label="Precio ($)"
          type="number"
          placeholder="350"
          value={form.price}
          onChange={setField('price')}
          error={errors.price}
          required
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar servicio'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
      <p className="text-sm text-neutral-400">
        Aún no tienes servicios. Agrega uno para que los clientes puedan reservar.
      </p>
      <Button onClick={onAdd}>Agregar servicio</Button>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BusinessServicesPage() {
  const [businessType, setBusinessType] = useState(null)
  const [services,     setServices]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchBusiness() {
      setLoading(true)
      try {
        const business = await getMyBusiness()
        if (!cancelled) {
          setBusinessType(business.type)
          setServices(business.services ?? [])
        }
      } catch (err) {
        console.error('Error cargando servicios:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchBusiness()
    return () => { cancelled = true }
  }, [])

  const handleCreated = useCallback((newService) => {
    setServices((prev) => [...prev, newService])
    setShowForm(false)
  }, [])

  return (
    <BusinessLayout>

      <section className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Servicios</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Gestiona los servicios que ofreces. Expande uno para personalizar su horario.
          </p>
        </div>
        {!showForm && services.length > 0 && (
          <Button onClick={() => setShowForm(true)}>Agregar servicio</Button>
        )}
      </section>

      {showForm && (
        <section className="mb-6">
          <ServiceForm
            businessType={businessType}
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      <section>
        <SectionTitle
          title="Mis servicios"
          subtitle={loading ? '—' : `${services.length} servicio${services.length !== 1 ? 's' : ''}`}
          className="mb-4"
        />

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : services.length === 0 && !showForm ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="flex flex-col gap-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>

    </BusinessLayout>
  )
}
