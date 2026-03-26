export const CATEGORIES_BY_TYPE = {
  all: [
    { id: 'all', label: 'Todos' },
  ],
  restaurant: [
    { id: 'all',           label: 'Todos' },
    { id: 'mexican',       label: 'Mexicana' },
    { id: 'italian',       label: 'Italiana' },
    { id: 'japanese',      label: 'Japonesa' },
    { id: 'american',      label: 'Americana' },
    { id: 'seafood',       label: 'Mariscos' },
    { id: 'mediterranean', label: 'Mediterránea' },
    { id: 'chinese',       label: 'China' },
    { id: 'vegan',         label: 'Vegana' },
    { id: 'brunch',        label: 'Brunch' },
    { id: 'fusion',        label: 'Fusión' },
  ],
  spa: [
    { id: 'all',          label: 'Todos' },
    { id: 'massage',      label: 'Masajes' },
    { id: 'facial',       label: 'Faciales' },
    { id: 'body',         label: 'Tratamientos corporales' },
    { id: 'aromatherapy', label: 'Aromaterapia' },
    { id: 'hydrotherapy', label: 'Hidroterapia' },
    { id: 'meditation',   label: 'Meditación' },
  ],
  medical: [
    { id: 'all',             label: 'Todos' },
    { id: 'general',         label: 'Medicina general' },
    { id: 'dermatology',     label: 'Dermatología' },
    { id: 'dentistry',       label: 'Odontología' },
    { id: 'nutrition',       label: 'Nutrición' },
    { id: 'psychology',      label: 'Psicología' },
    { id: 'physiotherapy',   label: 'Fisioterapia' },
  ],
  salon: [
    { id: 'all',      label: 'Todos' },
    { id: 'haircut',  label: 'Corte' },
    { id: 'color',    label: 'Color' },
    { id: 'nails',    label: 'Uñas' },
    { id: 'beard',    label: 'Barba' },
    { id: 'makeup',   label: 'Maquillaje' },
    { id: 'keratin',  label: 'Keratina' },
  ],
}

export default function CategoryFilter({
  categories = CATEGORIES_BY_TYPE.restaurant,
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
