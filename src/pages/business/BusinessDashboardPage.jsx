import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BusinessLayout from '../../layouts/BusinessLayout'
import MetricCard from '../../components/business/MetricCard'
import MetricCardSkeleton from '../../components/business/MetricCardSkeleton'
import OverviewCard from '../../components/business/OverviewCard'
import SectionTitle from '../../components/ui/SectionTitle'
import { getMetrics } from '../../services/businesses'

function buildMetricCards(metrics) {
  return [
    { label: 'Reservas hoy',      value: String(metrics.todayAppointments),           trend: 0, trendLabel: 'vs ayer' },
    { label: 'Esta semana',       value: String(metrics.weekAppointments),            trend: 0, trendLabel: 'vs semana anterior' },
    { label: 'Tasa de ocupación', value: `${metrics.occupancyRate}%`,                 trend: 0, trendLabel: 'esta semana' },
    { label: 'Ingresos del mes',  value: `$${metrics.monthRevenue.toLocaleString()}`, trend: 0, trendLabel: 'vs mes anterior' },
  ]
}

function buildOverviewMetrics(overview, period) {
  const d = overview[period]
  return [
    { label: 'Total reservas', value: String(d.totalReservations), sublabel: period === 'week' ? 'esta semana' : 'este mes' },
    { label: 'Ingresos',       value: `$${d.revenue.toLocaleString()}`,  sublabel: period === 'week' ? 'esta semana' : 'este mes' },
  ]
}

const EMPTY_CHART = {
  week:  ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((l) => ({ label: l, value: 0 })),
  month: ['S1','S2','S3','S4'].map((l) => ({ label: l, value: 0 })),
}

export default function BusinessDashboardPage() {
  const navigate = useNavigate()
  const [period,      setPeriod]      = useState('week')
  const [metricCards, setMetricCards] = useState([])
  const [chartData,   setChartData]   = useState(EMPTY_CHART)
  const [overview,    setOverview]    = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchMetrics() {
      setLoading(true)
      try {
        const metrics = await getMetrics()
        if (!cancelled) {
          setMetricCards(buildMetricCards(metrics))
          setChartData(metrics.chart ?? EMPTY_CHART)
          setOverview(metrics.overview ?? null)
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          navigate('/business/setup', { replace: true })
          return
        }
        console.error('Error cargando métricas:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMetrics()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <BusinessLayout>

      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Resumen de actividad y métricas de tu negocio.
        </p>
      </section>

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <SectionTitle title="Métricas clave" className="mb-4" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />)
            : metricCards.map((m) => (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  trend={m.trend}
                  trendLabel={m.trendLabel}
                />
              ))
          }
        </div>
      </section>

      {/* ── Resumen con gráfica ───────────────────────────────────────── */}
      <section>
        <OverviewCard
          title="Resumen de reservas"
          period={period}
          onPeriodChange={setPeriod}
          metrics={overview ? buildOverviewMetrics(overview, period) : []}
          chartData={chartData[period] ?? []}
        />
      </section>

    </BusinessLayout>
  )
}
