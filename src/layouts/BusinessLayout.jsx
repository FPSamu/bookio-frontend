import { NavLink } from 'react-router-dom'

// ── Íconos ────────────────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
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

// ── Datos de navegación ───────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/business/dashboard',    label: 'Dashboard',     icon: <GridIcon /> },
  { to: '/business/reservations', label: 'Reservaciones', icon: <CalendarIcon /> },
]

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950">
        <span className="text-xs font-bold text-white">B</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-neutral-900">Bookio</span>
        <span className="text-[10px] font-medium text-neutral-400">Panel de negocio</span>
      </div>
    </div>
  )
}

function UserAvatar({ name = 'U' }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-300">
      {initial}
    </div>
  )
}

// ── Navbar desktop ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8">

        <Logo />

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

        <div className="flex items-center gap-3">
          <UserAvatar name="Negocio" />
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

export default function BusinessLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <BottomNav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 md:pb-12">
        {children}
      </main>
    </div>
  )
}
