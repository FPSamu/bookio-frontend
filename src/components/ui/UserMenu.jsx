import { useState, useRef, useEffect } from 'react'

function LogOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function UserMenu({ name, email, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const initial = (name ?? 'U').charAt(0).toUpperCase()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-900 truncate">{name ?? 'Usuario'}</p>
            {email && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">{email}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOutIcon />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
