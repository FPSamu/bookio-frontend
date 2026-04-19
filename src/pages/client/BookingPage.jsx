import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ClientLayout from '../../layouts/ClientLayout'
import CalendarGrid from '../../components/business/CalendarGrid'
import { getBusinessForBooking, getAvailableSlots, bookAppointment } from '../../services/booking'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

// ── Indicador de pasos ────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  const steps = ['Servicio', 'Fecha', 'Horario']
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num   = i + 1
        const done  = num < current
        const active = num === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={[
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                done   ? 'bg-emerald-500 text-white'
                : active ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200 text-neutral-400',
              ].join(' ')}>
                {done ? '✓' : num}
              </span>
              <span className={[
                'text-xs font-medium hidden sm:block',
                active ? 'text-neutral-900' : 'text-neutral-400',
              ].join(' ')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={[
                'h-px w-8 transition-colors',
                done ? 'bg-emerald-500' : 'bg-neutral-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Tarjeta de servicio ───────────────────────────────────────────────────────

function ServiceCard({ service, selected, onSelect }) {
  const { name, duration_minutes, price } = service
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={[
        'w-full text-left rounded-xl border px-5 py-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
        selected
          ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
          : 'border-neutral-100 bg-white text-neutral-900 hover:border-neutral-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className={`text-xs ${selected ? 'text-neutral-300' : 'text-neutral-400'}`}>
            ~{duration_minutes} min
          </span>
        </div>
        <span className="flex-shrink-0 text-sm font-bold">
          ${Number(price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </span>
      </div>
    </button>
  )
}

// ── Grid de slots de horario ──────────────────────────────────────────────────

function SlotGrid({ slots, selected, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    )
  }
  if (slots.length === 0) {
    return (
      <p className="text-sm text-neutral-400 py-4">
        No hay horarios disponibles para este día. Prueba con otra fecha.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={[
            'rounded-lg border py-2 text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
            selected === slot
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400',
          ].join(' ')}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}

// ── Panel de confirmación ─────────────────────────────────────────────────────

function ConfirmPanel({ business, service, dateStr, time, onConfirm, loading, error }) {
  const [d, m, y] = [
    ...dateStr.split('-').reverse().map(Number)
  ]
  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const label = `${d} ${MONTHS[m - 1]} ${y}`

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
      <p className="text-sm font-semibold text-neutral-700 mb-4">Resumen de tu reserva</p>

      <div className="flex flex-col gap-2 text-sm mb-5">
        <div className="flex justify-between">
          <span className="text-neutral-400">Negocio</span>
          <span className="font-medium text-neutral-900">{business.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Servicio</span>
          <span className="font-medium text-neutral-900">{service.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Duración</span>
          <span className="font-medium text-neutral-900">~{service.duration_minutes} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Fecha</span>
          <span className="font-medium text-neutral-900">{label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400">Hora</span>
          <span className="font-medium text-neutral-900">{time}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 mt-1">
          <span className="text-neutral-400">Total</span>
          <span className="text-base font-bold text-neutral-900">
            ${Number(service.price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? 'Reservando...' : 'Confirmar reserva'}
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function BookingPage() {
  const { businessId } = useParams()
  const navigate       = useNavigate()

  const [business,         setBusiness]         = useState(null)
  const [loadingBusiness,  setLoadingBusiness]  = useState(true)
  const [selectedService,  setSelectedService]  = useState(null)

  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const [slots,        setSlots]        = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)

  const [booking,      setBooking]      = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Paso actual para el indicador
  const step = !selectedService ? 1 : !selectedDate ? 2 : 3

  // Set de fechas con bloqueo de día completo (para el calendario)
  const blockedDates = useMemo(() => {
    const set = new Set()
    business?.blockedSlots?.forEach((b) => set.add(b.date))
    return set
  }, [business])

  // Set de días de la semana (0-6) en que el negocio está cerrado
  const closedDows = useMemo(() => {
    const openDows = new Set((business?.schedules ?? []).map((s) => s.day_of_week))
    const closed = new Set()
    for (let i = 0; i <= 6; i++) {
      if (!openDows.has(i)) closed.add(i)
    }
    return closed
  }, [business])

  // ── Carga inicial: negocio + servicios en un solo request ─────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingBusiness(true)
    getBusinessForBooking(businessId)
      .then((b) => { if (!cancelled) setBusiness(b) })
      .catch(() => { if (!cancelled) navigate('/dashboard', { replace: true }) })
      .finally(() => { if (!cancelled) setLoadingBusiness(false) })
    return () => { cancelled = true }
  }, [businessId, navigate])

  // ── Fetch de slots cada vez que cambia servicio o fecha ───────────────────
  useEffect(() => {
    if (!selectedService || !selectedDate) return
    let cancelled = false
    setSlots([])
    setSelectedTime(null)
    setLoadingSlots(true)
    getAvailableSlots({
      businessId,
      serviceId:       selectedService.id,
      dateStr:         toKey(selectedDate),
      serviceDuration: selectedService.duration_minutes,
    })
      .then((s) => { if (!cancelled) setSlots(s) })
      .catch(() => { if (!cancelled) setSlots([]) })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [selectedService, selectedDate, businessId])

  const handleServiceSelect = useCallback((service) => {
    setSelectedService(service)
    setSelectedDate(null)
    setSelectedTime(null)
    setSlots([])
  }, [])

  const handleDateSelect = useCallback((date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (d < TODAY) return
    if (blockedDates.has(toKey(date))) return
    if (closedDows.has(date.getDay())) return
    setSelectedDate(date)
    setSelectedTime(null)
  }, [blockedDates, closedDows])

  const handleMonthChange = useCallback((delta) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }, [year, month])

  const handleConfirm = async () => {
    setBooking(true)
    setBookingError('')
    try {
      await bookAppointment({
        businessId,
        serviceId: selectedService.id,
        dateStr:   toKey(selectedDate),
        time:      selectedTime,
      })
      navigate('/reservations')
    } catch (err) {
      setBookingError(
        err?.response?.status === 409
          ? 'Ese horario ya fue reservado. Elige otro.'
          : err?.response?.status === 400
          ? 'Ese horario ya pasó. Elige otro.'
          : 'No se pudo completar la reserva. Intenta de nuevo.'
      )
    } finally {
      setBooking(false)
    }
  }

  // ── Loading inicial ───────────────────────────────────────────────────────
  if (loadingBusiness) {
    return (
      <ClientLayout>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-4 w-32 animate-pulse rounded-lg bg-neutral-100" />
          <div className="mt-4 flex flex-col gap-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />)}
          </div>
        </div>
      </ClientLayout>
    )
  }

  if (!business) return null

  return (
    <ClientLayout>

      {/* ── Header del negocio ────────────────────────────────────────── */}
      <section className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">{business.name}</h1>
        {business.address && (
          <p className="mt-1 text-sm text-neutral-400">{business.address}</p>
        )}
      </section>

      <StepIndicator current={step} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">

          {/* ── Paso 1: Seleccionar servicio ──────────────────────────── */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-neutral-900">
              1. Elige un servicio
            </h2>
            {business.services?.length === 0 ? (
              <p className="text-sm text-neutral-400">
                Este negocio aún no tiene servicios disponibles.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {business.services?.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    selected={selectedService?.id === s.id}
                    onSelect={handleServiceSelect}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Paso 2: Seleccionar fecha ─────────────────────────────── */}
          {selectedService && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-neutral-900">
                2. Elige una fecha
              </h2>
              <CalendarGrid
                year={year}
                month={month}
                selectedDate={selectedDate}
                blockedDates={blockedDates}
                closedDows={closedDows}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
            </section>
          )}

          {/* ── Paso 3: Seleccionar horario ───────────────────────────── */}
          {selectedDate && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-neutral-900">
                3. Elige un horario
              </h2>
              <SlotGrid
                slots={slots}
                selected={selectedTime}
                onSelect={setSelectedTime}
                loading={loadingSlots}
              />
            </section>
          )}

        </div>

        {/* ── Panel de confirmación (sidebar) ───────────────────────── */}
        {selectedTime && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ConfirmPanel
              business={business}
              service={selectedService}
              dateStr={toKey(selectedDate)}
              time={selectedTime}
              onConfirm={handleConfirm}
              loading={booking}
              error={bookingError}
            />
          </div>
        )}

      </div>

    </ClientLayout>
  )
}
