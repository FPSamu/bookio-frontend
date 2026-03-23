const OPTIONS = [
  {
    value: 'client',
    label: 'Soy cliente',
    description: 'Quiero reservar en restaurantes',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    value: 'restaurant',
    label: 'Soy restaurante',
    description: 'Quiero gestionar mis reservas',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
]

export default function AccountTypeSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((option) => {
        const isSelected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'flex items-center gap-4 rounded-xl border-[1.5px] px-4 py-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
              isSelected
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-neutral-200 bg-white hover:border-neutral-400',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={isSelected}
          >
            {/* Ícono */}
            <span
              className={[
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
                isSelected
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-500',
              ].join(' ')}
            >
              {option.icon}
            </span>

            {/* Texto */}
            <span className="flex flex-col gap-0.5">
              <span
                className={`text-sm font-semibold ${
                  isSelected ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                {option.label}
              </span>
              <span className="text-xs text-neutral-400">{option.description}</span>
            </span>

            {/* Indicador de selección */}
            <span className="ml-auto flex-shrink-0">
              <span
                className={[
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-150',
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900'
                    : 'border-neutral-300 bg-white',
                ].join(' ')}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
