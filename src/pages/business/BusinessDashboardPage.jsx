import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BusinessLayout from '../../layouts/BusinessLayout'
import { getMetrics } from '../../services/businesses'
import ReservationsBarChart from '../../components/business/ReservationsBarChart'

// ── Date helpers ──────────────────────────────────────────────────────────────

function getMonthLabel() {
  const now = new Date()
  const m   = now.toLocaleString('es-MX', { month: 'long' })
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${now.getFullYear()}`
}

function getWeekLabel() {
  const now   = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

function formatWeeklyChart(weeklyPerformance = []) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  if (weeklyPerformance.length === 0)
    return days.map(l => ({ label: l, value: 0 }))
  return weeklyPerformance.map(item => ({ label: days[item.day], value: item.count }))
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4H4a2 2 0 0 0-2 2v4a6 6 0 0 0 6 6" />
      <path d="M17 4h3a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6" />
      <rect x="7" y="2" width="10" height="10" rx="2" />
    </svg>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, accent = 'neutral', loading = false }) {
  const accents = {
    neutral: { bg: 'bg-neutral-100',  text: 'text-neutral-600' },
    emerald: { bg: 'bg-emerald-50',   text: 'text-emerald-600' },
    blue:    { bg: 'bg-blue-50',      text: 'text-blue-600'    },
    red:     { bg: 'bg-red-50',       text: 'text-red-500'     },
    amber:   { bg: 'bg-amber-50',     text: 'text-amber-600'   },
  }
  const { bg, text } = accents[accent] ?? accents.neutral

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm animate-pulse">
        <div className="h-9 w-9 rounded-xl bg-neutral-100 mb-4" />
        <div className="h-7 w-20 rounded-lg bg-neutral-100 mb-2" />
        <div className="h-3 w-28 rounded bg-neutral-100" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${text}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-neutral-900 tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-neutral-500">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const month = getMonthLabel()
  const week  = getWeekLabel()

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      setLoading(true)
      try {
        const data = await getMetrics()
        if (!cancelled) setMetrics(data)
      } catch (err) {
        if (err?.response?.status === 404) {
          navigate('/business/setup', { replace: true })
          return
        }
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [navigate])

  const chartData = metrics ? formatWeeklyChart(metrics.weeklyPerformance) : formatWeeklyChart([])
  const maxWeek   = chartData.reduce((s, d) => s + d.value, 0)

  // Popular services — max count for relative bars
  const services    = metrics?.popularServices ?? []
  const maxCount    = Math.max(...services.map(s => s.count), 1)

  return (
    <BusinessLayout>

      {/* ── Encabezado ── */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Métricas de tu negocio · {month}
        </p>
      </section>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          No se pudieron cargar las métricas. Intenta de nuevo.
        </div>
      )}

      {/* ── KPIs del mes ── */}
      <section className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Resumen del mes
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard loading={loading} icon={<CalendarIcon />} accent="blue"
            label="Reservas totales" sub={month}
            value={metrics?.totalAppointments ?? 0} />
          <KpiCard loading={loading} icon={<UsersIcon />} accent="emerald"
            label="Clientes únicos" sub={month}
            value={metrics?.newClients ?? 0} />
          <KpiCard loading={loading} icon={<XCircleIcon />} accent="red"
            label="Cancelaciones" sub={month}
            value={metrics?.cancellations ?? 0} />
          <KpiCard loading={loading} icon={<DollarIcon />} accent="amber"
            label="Ingresos estimados" sub={month}
            value={`$${(metrics?.totalRevenue ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`} />
        </div>
      </section>

      {/* ── Gráfica semanal ── */}
      <section className="mb-6">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-bold text-neutral-900">Reservas esta semana</p>
              <p className="mt-0.5 text-xs text-neutral-400">{week}</p>
            </div>
            {!loading && (
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-neutral-900">{maxWeek}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">total</span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex h-36 items-end gap-2 px-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex-1 rounded-t-xl bg-neutral-100 animate-pulse"
                  style={{ height: `${20 + Math.random() * 60}%` }} />
              ))}
            </div>
          ) : (
            <ReservationsBarChart data={chartData} />
          )}
        </div>
      </section>

      {/* ── Servicios Populares ── */}
      {!loading && services.length > 0 && (
        <section>
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <TrophyIcon />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">Servicios más reservados</p>
                <p className="text-[11px] text-neutral-400">{month}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {services.map((service, i) => {
                const pct = Math.round((service.count / maxCount) * 100)
                const rankColors = [
                  { bg: 'bg-amber-50',   text: 'text-amber-500',  ring: 'ring-amber-200'  }, // 1st
                  { bg: 'bg-neutral-100',text: 'text-neutral-400', ring: 'ring-neutral-200' }, // 2nd
                  { bg: 'bg-orange-50',  text: 'text-orange-400', ring: 'ring-orange-200'  }, // 3rd
                ]
                const rank = rankColors[i] ?? { bg: 'bg-neutral-50', text: 'text-neutral-400', ring: 'ring-neutral-100' }
                return (
                  <div key={i} className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-1 text-xs font-black ${rank.bg} ${rank.text} ${rank.ring}`}>
                      {i === 0 ? (
                        /* Trophy for #1 */
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="11" />
                          <path d="M7 4H4a2 2 0 0 0-2 2v3a6 6 0 0 0 6 6" />
                          <path d="M17 4h3a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6" />
                          <rect x="7" y="2" width="10" height="9" rx="2" />
                        </svg>
                      ) : i === 1 ? (
                        /* Medal for #2 */
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="14" r="6" />
                          <path d="M8 2h8l-1 6H9z" />
                        </svg>
                      ) : i === 2 ? (
                        /* Star for #3 */
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-neutral-800 truncate">{service.name}</span>
                        <span className="ml-2 flex-shrink-0 text-xs font-bold text-neutral-500">
                          {service.count} {service.count === 1 ? 'reserva' : 'reservas'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-neutral-900 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

    </BusinessLayout>
  )
}
