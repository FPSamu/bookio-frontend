function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Busca restaurantes, cafeterías, spas…',
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(value)
  }

  const handleClear = () => {
    onChange?.({ target: { value: '' } })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.12)] focus-within:border-neutral-400"
      role="search"
    >
      {/* Ícono de búsqueda */}
      <span className="flex-shrink-0 text-neutral-400">
        <SearchIcon />
      </span>

      {/* Input */}
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
        aria-label="Buscar negocios"
      />

      {/* Botón limpiar — visible solo cuando hay texto */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 rounded-full p-0.5 text-neutral-400 transition-colors hover:text-neutral-700"
          aria-label="Limpiar búsqueda"
        >
          <ClearIcon />
        </button>
      )}

      {/* Botón buscar */}
      <button
        type="submit"
        className="flex-shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-95"
      >
        Buscar
      </button>
    </form>
  )
}
