import ReservationsBarChart from './ReservationsBarChart'

const PERIODS = [
  { id: 'week',  label: 'Semana' },
  { id: 'month', label: 'Mes' },
]

export default function OverviewCard({
  title = 'Resumen de reservas',
  metrics = [],
  chartData = [],
  period = 'week',
  onPeriodChange,
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>

        {/* Selector de período */}
        <div className="flex gap-1 rounded-full bg-neutral-100 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange?.(p.id)}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                period === p.id
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Métricas ── */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <span className="text-xs text-neutral-400">{m.label}</span>
              <span className="text-[22px] font-bold leading-none text-neutral-900">
                {m.value}
              </span>
              {m.sublabel && (
                <span className="text-[11px] text-neutral-400">{m.sublabel}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Gráfica ── */}
      {chartData.length > 0 && (
        <ReservationsBarChart data={chartData} />
      )}
    </div>
  )
}
