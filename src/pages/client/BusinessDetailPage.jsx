import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ClientLayout from '../../layouts/ClientLayout'
import RatingStars from '../../components/ui/RatingStars'
import {
  getBusinessById,
  getBusinessServices,
  getBusinessSchedule,
  getBusinessReviews,
} from '../../services/businesses'

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const PLACEHOLDER_GRADIENTS = [
  'from-violet-100 to-indigo-100',
  'from-amber-100 to-orange-100',
  'from-emerald-100 to-teal-100',
  'from-rose-100 to-pink-100',
  'from-sky-100 to-blue-100',
]

function placeholderGradient(id = '') {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${(m || '00').padStart(2, '0')} ${period}`
}

function buildScheduleGroups(schedule) {
  const groups = []
  for (const entry of schedule) {
    const day   = entry.day_of_week
    const start = entry.start_time || ''
    const end   = entry.end_time   || ''
    const existing = groups.find(g => g.start === start && g.end === end)
    if (existing) {
      existing.days.push(day)
    } else {
      groups.push({ days: [day], start, end })
    }
  }
  return groups
}

function groupDayLabel(group) {
  if (group.days.length === 1) return DAY_NAMES_FULL[group.days[0]]
  const sorted = [...group.days].sort((a, b) => a - b)
  const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1)
  if (consecutive && sorted.length > 2) {
    return `${DAY_NAMES_SHORT[sorted[0]]} – ${DAY_NAMES_SHORT[sorted[sorted.length - 1]]}`
  }
  return sorted.map(d => DAY_NAMES_SHORT[d]).join(', ')
}

function formatReviewDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return ''
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Icons ──────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 21.73 16.92z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ServicesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function StarIcon({ filled }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5} className="w-3.5 h-3.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-neutral-500">{icon}</span>
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
    </div>
  )
}

function BarSkeleton() {
  return <div className="h-16 rounded-xl bg-neutral-100" />
}

function ServiceItem({ service }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 truncate">{service.name}</p>
        <p className="mt-0.5 text-xs text-neutral-400">{service.duration_minutes} min</p>
      </div>
      <span className="ml-4 flex-shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-800">
        ${Number(service.price ?? 0).toFixed(2)}
      </span>
    </div>
  )
}

function ReviewCard({ review }) {
  const score      = Number(review.score ?? 0)
  const comment    = review.comment || ''
  const clientName = review.client?.name || 'Cliente'
  const date       = formatReviewDate(review.createdAt || review.created_at)

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-neutral-900">{clientName}</span>
        {date && <span className="text-xs text-neutral-400 flex-shrink-0">{date}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < Math.round(score)} />
        ))}
      </div>
      {comment && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{comment}</p>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function BusinessDetailPage() {
  const { businessId } = useParams()
  const navigate       = useNavigate()

  const [business,        setBusiness]        = useState(null)
  const [services,        setServices]        = useState([])
  const [schedule,        setSchedule]        = useState([])
  const [reviews,         setReviews]         = useState([])
  const [loadingBiz,      setLoadingBiz]      = useState(true)
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(true)
  const [loadingReviews,  setLoadingReviews]  = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchBusiness() {
      try {
        const biz = await getBusinessById(businessId)
        if (!cancelled) setBusiness(biz)
      } catch (err) {
        console.error('Error cargando negocio:', err)
      } finally {
        if (!cancelled) setLoadingBiz(false)
      }
    }

    async function fetchServices() {
      try {
        const svcs = await getBusinessServices(businessId)
        if (!cancelled) setServices(svcs)
      } catch (_) {
      } finally {
        if (!cancelled) setLoadingServices(false)
      }
    }

    async function fetchSchedule() {
      try {
        const sch = await getBusinessSchedule(businessId)
        if (!cancelled) setSchedule(sch)
      } catch (_) {
      } finally {
        if (!cancelled) setLoadingSchedule(false)
      }
    }

    async function fetchReviews() {
      try {
        const revs = await getBusinessReviews(businessId)
        if (!cancelled) setReviews(revs)
      } catch (_) {
      } finally {
        if (!cancelled) setLoadingReviews(false)
      }
    }

    fetchBusiness()
    fetchServices()
    fetchSchedule()
    fetchReviews()

    return () => { cancelled = true }
  }, [businessId])

  const scheduleGroups = buildScheduleGroups(schedule)
  const heroImage      = business?.photos?.[0] ?? business?.imageUrl ?? null

  // ── Loading state ──────────────────────────────────────────────────────
  if (loadingBiz) {
    return (
      <ClientLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-20 rounded-lg bg-neutral-100" />
          <div className="h-64 rounded-2xl bg-neutral-100" />
          <div className="h-36 rounded-2xl bg-neutral-100" />
          <div className="h-24 rounded-2xl bg-neutral-100" />
        </div>
      </ClientLayout>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (!business) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-neutral-500">No encontramos este negocio.</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-neutral-900 underline"
          >
            Volver al inicio
          </button>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      {/* ── Back ── */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <BackIcon />
          Volver
        </button>
      </div>

      {/* ── Hero image ── */}
      <div className="relative mb-6 h-64 w-full overflow-hidden rounded-2xl">
        {heroImage ? (
          <img
            src={heroImage}
            alt={business.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${placeholderGradient(business.id)}`} />
        )}
        {business.photos?.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {business.photos.length} fotos
          </span>
        )}
      </div>

      <div className="space-y-6 pb-8">
        {/* ── Info principal ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            {business.imageUrl && (
              <img
                src={business.imageUrl}
                alt={business.name}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-neutral-100"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight text-neutral-900">{business.name}</h1>
              {business.category && (
                <span className="mt-1.5 inline-block rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {business.category}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <RatingStars value={business.rating} size="md" showValue reviewCount={business.reviewCount} />
          </div>

          {(business.location || business.phone) && (
            <div className="mt-4 space-y-2.5 border-t border-neutral-100 pt-4">
              {business.location && (
                <div className="flex items-start gap-2 text-sm text-neutral-500">
                  <span className="mt-0.5 flex-shrink-0"><LocationIcon /></span>
                  <span>{business.location}</span>
                </div>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <PhoneIcon />
                  {business.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Servicios ── */}
        <section>
          <SectionHeader icon={<ServicesIcon />} title="Servicios" />
          {loadingServices ? (
            <div className="animate-pulse space-y-3">
              <BarSkeleton /><BarSkeleton /><BarSkeleton />
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-neutral-400">No hay servicios disponibles.</p>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <ServiceItem key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>

        {/* ── Horarios ── */}
        <section>
          <SectionHeader icon={<ClockIcon />} title="Horarios" />
          {loadingSchedule ? (
            <div className="animate-pulse">
              <BarSkeleton />
            </div>
          ) : schedule.length === 0 ? (
            <p className="text-sm text-neutral-400">No hay horarios disponibles.</p>
          ) : (
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="divide-y divide-neutral-50">
                {scheduleGroups.map((g, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm text-neutral-600">{groupDayLabel(g)}</span>
                    </div>
                    <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {formatTime(g.start)} – {formatTime(g.end)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Reseñas ── */}
        <section>
          <SectionHeader
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            title="Reseñas"
          />
          {loadingReviews ? (
            <div className="animate-pulse space-y-3">
              <BarSkeleton /><BarSkeleton />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 text-center shadow-sm">
              <p className="text-sm text-neutral-400">Aún no hay reseñas para este negocio.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 10).map((review, i) => (
                <ReviewCard key={review.id ?? i} review={review} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA Reservar ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate(`/booking/${business.id}`)}
            className="w-full rounded-full bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]"
          >
            Reservar ahora
          </button>
        </div>
      </div>
    </ClientLayout>
  )
}
