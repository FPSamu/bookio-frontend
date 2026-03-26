function TrendUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function TrendDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// trend: número positivo = sube (verde), negativo = baja (rojo), null = sin tendencia
export default function MetricCard({ label = '', value = '—', trend = null, trendLabel = '' }) {
  const isPositive = trend > 0
  const isNegative = trend < 0

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">

      <span className="text-[11px] font-medium text-neutral-400">{label}</span>

      <span className="text-xl font-bold leading-none text-neutral-900">{value}</span>

      {trend !== null && (
        <div
          className={[
            'mt-0.5 flex items-center gap-0.5 text-[11px] font-semibold',
            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-neutral-400',
          ].join(' ')}
        >
          {isPositive && <TrendUpIcon />}
          {isNegative && <TrendDownIcon />}
          <span>
            {isPositive ? '+' : ''}{trend}%{trendLabel ? ` ${trendLabel}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}
