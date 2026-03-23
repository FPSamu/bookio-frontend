export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'mexican', label: 'Mexicana' },
  { id: 'italian', label: 'Italiana' },
  { id: 'japanese', label: 'Japonesa' },
  { id: 'american', label: 'Americana' },
  { id: 'seafood', label: 'Mariscos' },
  { id: 'mediterranean', label: 'Mediterránea' },
  { id: 'chinese', label: 'China' },
  { id: 'vegan', label: 'Vegana' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'fusion', label: 'Fusión' },
]

export default function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  selected = 'all',
  onChange,
}) {
  return (
    <div className="relative">
      {/* Scroll horizontal sin scrollbar visible */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = selected === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange?.(cat.id)}
              className={[
                'flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
                isActive
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900',
              ].join(' ')}
            >
              {cat.icon && <span className="flex-shrink-0">{cat.icon}</span>}
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
