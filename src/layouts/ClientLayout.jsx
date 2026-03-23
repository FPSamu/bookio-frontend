import { NavLink } from 'react-router-dom'

// ── Íconos ────────────────────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

// ── Datos de navegación ───────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/dashboard', label: 'Explorar', icon: <CompassIcon /> },
  { to: '/reservations', label: 'Mis Reservas', icon: <CalendarIcon /> },
  { to: '/favorites', label: 'Favoritos', icon: <HeartIcon /> },
]

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950">
        <span className="text-xs font-bold text-white">B</span>
      </div>
      <span className="text-base font-bold tracking-tight text-neutral-900">
        Bookio
      </span>
    </div>
  )
}

function UserAvatar({ name = 'U' }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-300 transition-colors select-none">
      {initial}
    </div>
  )
}

// ── Navbar desktop ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Logo />

        {/* Nav links — solo desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-3">
          <UserAvatar name="Samuel" />
        </div>
      </div>
    </header>
  )
}

// ── Bottom nav mobile ─────────────────────────────────────────────────────────

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-100 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600',
              ].join(' ')
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <BottomNav />

      {/* Contenido: padding top = altura navbar, padding bottom mobile = bottom nav */}
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 md:pb-12">
        {children}
      </main>
    </div>
  )
}
