export default function ReservationsBarChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex h-36 items-end justify-between gap-2 px-1">
        {data.map((d, i) => {
          const heightPct = Math.max((d.value / max) * 100, 4) // minimum height
          const isMax = d.value === max && d.value > 0

          return (
            <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2 cursor-crosshair">
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-10 z-10 opacity-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl">
                  {d.value} <span className="font-normal text-neutral-400">reservas</span>
                </div>
              </div>

              {/* Bar Container */}
              <div className="flex w-full h-full items-end justify-center relative">
                <div
                  className={[
                    'w-full max-w-[32px] rounded-t-xl transition-all duration-500 ease-out',
                    d.value === 0
                      ? 'bg-neutral-100 group-hover:bg-neutral-200'
                      : isMax 
                        ? 'bg-gradient-to-t from-indigo-500 to-indigo-600 shadow-[0_4px_20px_rgba(99,102,241,0.4)] group-hover:brightness-110' 
                        : 'bg-indigo-300 group-hover:bg-indigo-400'
                  ].join(' ')}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Label */}
              <span className={[
                'text-[11px] font-bold transition-colors duration-200',
                d.value === 0 ? 'text-neutral-400 group-hover:text-neutral-600' : 'text-indigo-900'
              ].join(' ')}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
