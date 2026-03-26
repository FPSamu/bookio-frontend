const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// Devuelve "YYYY-MM-DD" para comparaciones sin problemas de zona horaria
function toKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

// Genera las 42 celdas del grid (6 filas × 7 columnas), empezando en lunes
function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // 0 = Dom → ajuste para semana lunes-primero
  const startDow = firstDay.getDay()
  const leadPad  = startDow === 0 ? 6 : startDow - 1

  const days = []

  for (let i = leadPad; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true })
  }
  const tailPad = 42 - days.length
  for (let i = 1; i <= tailPad; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }

  return days
}

// reservationDates: Set de strings "YYYY-MM-DD" con reservaciones
export default function CalendarGrid({
  year,
  month,
  selectedDate,
  reservationDates = new Set(),
  onDateSelect,
  onMonthChange,
}) {
  const todayKey    = toKey(new Date())
  const selectedKey = selectedDate ? toKey(selectedDate) : null
  const days        = buildCalendarDays(year, month)

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

      {/* ── Navegación de mes ── */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange?.(-1)}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <ChevronLeftIcon />
        </button>

        <span className="text-sm font-semibold text-neutral-900">
          {MONTH_NAMES[month]} {year}
        </span>

        <button
          type="button"
          onClick={() => onMonthChange?.(1)}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* ── Encabezados de días ── */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_HEADERS.map((d) => (
          <span key={d} className="text-center text-[11px] font-medium text-neutral-400">
            {d}
          </span>
        ))}
      </div>

      {/* ── Grid de días ── */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(({ date, isCurrentMonth }) => {
          const key             = toKey(date)
          const isToday         = key === todayKey
          const isSelected      = key === selectedKey
          const isPast          = date < new Date() && !isToday
          const hasReservations = reservationDates.has(key)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDateSelect?.(date)}
              className={[
                'relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
                isSelected
                  ? 'bg-neutral-900 text-white'
                  : isToday
                  ? 'border border-neutral-900 text-neutral-900'
                  : !isCurrentMonth || isPast
                  ? 'text-neutral-300'
                  : 'text-neutral-700 hover:bg-neutral-100',
              ].join(' ')}
            >
              {date.getDate()}

              {/* Dot: tiene reservaciones */}
              {hasReservations && !isSelected && (
                <span
                  className={[
                    'absolute bottom-0.5 h-1 w-1 rounded-full',
                    isToday ? 'bg-neutral-900' : 'bg-emerald-500',
                  ].join(' ')}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
