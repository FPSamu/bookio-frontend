import { useState, useEffect } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import MetricCard from '../../components/business/MetricCard'
import MetricCardSkeleton from '../../components/business/MetricCardSkeleton'
import OverviewCard from '../../components/business/OverviewCard'
import SectionTitle from '../../components/ui/SectionTitle'
import businessService from '../../services/business.service'

// ── Página ────────────────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    kpis: [],
    overviewStats: { week: [], month: [] },
    chartData: { week: [], month: [] }
  })

  useEffect(() => {
    let isMounted = true
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const data = await businessService.getMetrics()
        if (isMounted) {
          // Adapt the API response to the format needed by components
          // If API returns structure differently, map it here. Defaulting to assuming 
          // the backend returns the expected shape.
          setMetrics({
            kpis: data.kpis || [],
            overviewStats: data.overviewStats || { week: [], month: [] },
            chartData: data.chartData || { week: [], month: [] }
          })
        }
      } catch (error) {
        console.error('Error al cargar métricas del negocio:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchMetrics()
    return () => { isMounted = false }
  }, [])

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
            : metrics.kpis.map((m) => (
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
          metrics={metrics.overviewStats[period] || []}
          chartData={metrics.chartData[period] || []}
        />
      </section>

    </BusinessLayout>
  )
}
