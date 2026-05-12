import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  const { name, duration_minutes, price, photo_url } = service
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={[
        'w-full text-left overflow-hidden rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900',
        selected
          ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg'
          : 'border-neutral-100 bg-white text-neutral-900 hover:border-neutral-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
      ].join(' ')}
    >
      <div className="flex items-center gap-0">
        {photo_url && (
          <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden">
            <img
              src={photo_url}
              alt={name}
              className={`h-full w-full object-cover transition-opacity duration-200 ${selected ? 'opacity-80' : ''}`}
            />
          </div>
        )}
        <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="truncate text-sm font-bold">{name}</span>
            <span className={`text-xs ${selected ? 'text-neutral-300' : 'text-neutral-400'}`}>
              ~{duration_minutes} min
            </span>
          </div>
          <span className="flex-shrink-0 text-sm font-black">
            ${Number(price).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
          </span>
        </div>
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

// ── Pantalla de éxito ─────────────────────────────────────────────────────────

function SuccessScreen({ business, service, dateStr, time, onDone }) {
  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const parts = dateStr.split('-').map(Number)
  const label = `${parts[2]} ${MONTHS[parts[1] - 1]} ${parts[0]}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 animate-fade-in">
      <div className="mb-8">
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <circle
            cx="44" cy="44" r="38"
            stroke="#10b981" strokeWidth="4"
            className="animate-circle-grow"
            style={{ transformOrigin: 'center' }}
          />
          <path
            d="M28 44 L39 55 L60 32"
            stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            pathLength="100"
            style={{ strokeDashoffset: 100 }}
            className="animate-check-draw"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-black text-neutral-900 mb-2 text-center animate-slide-up">
        ¡Reserva confirmada!
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Tu cita ha sido registrada exitosamente.
      </p>

      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-neutral-50 p-5 animate-slide-up"
        style={{ animationDelay: '0.18s' }}
      >
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Negocio</span>
            <span className="font-semibold text-neutral-900">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Servicio</span>
            <span className="font-semibold text-neutral-900">{service.name}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="text-neutral-400">Fecha</span>
            <span className="font-semibold text-neutral-900 capitalize">{label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Hora</span>
            <span className="text-xl font-black text-neutral-900">{time}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full max-w-sm rounded-full bg-neutral-900 py-3.5 text-sm font-bold text-white hover:bg-neutral-700 active:scale-[0.98] transition-all animate-slide-up"
        style={{ animationDelay: '0.28s' }}
      >
        Ver mis reservas
      </button>
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

  const [booking,        setBooking]        = useState(false)
  const [bookingError,   setBookingError]   = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const dateSectionRef = useRef(null)
  const slotSectionRef = useRef(null)

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
    setTimeout(() => {
      dateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [])

  const handleDateSelect = useCallback((date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (d < TODAY) return
    if (blockedDates.has(toKey(date))) return
    if (closedDows.has(date.getDay())) return
    setSelectedDate(date)
    setSelectedTime(null)
    setTimeout(() => {
      slotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
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
      setBookingSuccess(true)
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

  if (bookingSuccess) {
    return (
      <SuccessScreen
        business={business}
        service={selectedService}
        dateStr={toKey(selectedDate)}
        time={selectedTime}
        onDone={() => navigate('/reservations')}
      />
    )
  }

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
            <section ref={dateSectionRef}>
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
            <section ref={slotSectionRef}>
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
