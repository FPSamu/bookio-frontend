import { useState } from 'react'
import BusinessLayout from '../../layouts/BusinessLayout'
import MetricCard from '../../components/business/MetricCard'
import MetricCardSkeleton from '../../components/business/MetricCardSkeleton'
import OverviewCard from '../../components/business/OverviewCard'
import SectionTitle from '../../components/ui/SectionTitle'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamadas a la API (GET /business/metrics?period=week|month)

const MOCK_METRICS = [
  { label: 'Reservas hoy',      value: '12',      trend: 20, trendLabel: 'vs ayer' },
  { label: 'Esta semana',       value: '48',      trend: 8,  trendLabel: 'vs semana anterior' },
  { label: 'Tasa de ocupación', value: '78%',     trend: 5,  trendLabel: 'vs semana anterior' },
  { label: 'Ingresos del mes',  value: '$24,800', trend: -3, trendLabel: 'vs mes anterior' },
]

const MOCK_CHART_DATA = {
  week: [
    { label: 'Lun', value: 8  },
    { label: 'Mar', value: 12 },
    { label: 'Mié', value: 6  },
    { label: 'Jue', value: 15 },
    { label: 'Vie', value: 18 },
    { label: 'Sáb', value: 20 },
    { label: 'Dom', value: 10 },
  ],
  month: [
    { label: 'S1', value: 48 },
    { label: 'S2', value: 61 },
    { label: 'S3', value: 55 },
    { label: 'S4', value: 72 },
  ],
}

const MOCK_OVERVIEW_METRICS = {
  week: [
    { label: 'Total reservas', value: '89',  sublabel: 'esta semana' },
    { label: 'Confirmadas',    value: '76' },
    { label: 'Canceladas',     value: '13' },
  ],
  month: [
    { label: 'Total reservas', value: '236', sublabel: 'este mes' },
    { label: 'Confirmadas',    value: '198' },
    { label: 'Canceladas',     value: '38'  },
  ],
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const [period, setPeriod] = useState('week')
  const [loading] = useState(false) // TODO: true mientras carga la API

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
            : MOCK_METRICS.map((m) => (
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
          metrics={MOCK_OVERVIEW_METRICS[period]}
          chartData={MOCK_CHART_DATA[period]}
        />
      </section>

    </BusinessLayout>
  )
}
