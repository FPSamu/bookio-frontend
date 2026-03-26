export const RESERVATION_TABS = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'past',     label: 'Pasadas' },
  { id: 'cancelled', label: 'Canceladas' },
]

export default function ReservationTabFilter({
  tabs = RESERVATION_TABS,
  selected = 'upcoming',
  onChange,
}) {
  return (
    <div className="flex gap-1.5">
      {tabs.map((tab) => {
        const isActive = selected === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange?.(tab.id)}
            className={[
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
              isActive
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
