// data: [{ label: 'Lun', value: 8 }, ...]
export default function ReservationsBarChart({ data = [], activeColor = 'bg-neutral-900', inactiveColor = 'bg-neutral-200' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex flex-col gap-2">

      {/* Barras */}
      <div className="flex h-24 items-end gap-1.5">
        {data.map((d) => {
          const heightPct = Math.max((d.value / max) * 100, 8)
          const isMax = d.value === max
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
              {d.value > 0 && (
                <span className="text-[10px] font-medium text-neutral-400">{d.value}</span>
              )}
              <div
                className={`w-3 rounded-t-[4px] transition-all duration-300 ${isMax ? activeColor : inactiveColor}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* Eje */}
      <div className="h-px w-full bg-neutral-100" />

      {/* Etiquetas */}
      <div className="flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[10px] text-neutral-400"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
