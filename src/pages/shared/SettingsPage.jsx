import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ClientLayout from '../../layouts/ClientLayout'
import BusinessLayout from '../../layouts/BusinessLayout'
import { getMyBusiness } from '../../services/businesses'

// ── Icons ────────────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function QRIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="14" /><line x1="17" y1="14" x2="17" y2="14" />
      <line x1="20" y1="14" x2="20" y2="14" /><line x1="14" y1="17" x2="14" y2="17" />
      <line x1="17" y1="17" x2="17" y2="17" /><line x1="20" y1="20" x2="20" y2="20" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-neutral-300" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
      {children}
    </p>
  )
}

function SettingsTile({ icon, label, to, onClick }) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-neutral-800">{label}</span>
      <ChevronIcon />
    </div>
  )

  if (to) {
    return <Link to={to} className="block transition-colors hover:bg-neutral-50">{inner}</Link>
  }
  return (
    <button type="button" onClick={onClick} className="w-full text-left transition-colors hover:bg-neutral-50">
      {inner}
    </button>
  )
}

function SettingsGroup({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <div className="divide-y divide-neutral-50">{children}</div>
    </div>
  )
}

function LogoutModal({ onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-bold text-neutral-900">Cerrar sesión</h3>
        <p className="mt-2 text-sm text-neutral-500">¿Estás seguro de que deseas cerrar sesión?</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Saliendo…' : 'Sí, cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isBusiness = user?.role === 'BUSINESS_OWNER'

  const [showLogout,    setShowLogout]    = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [businessLogo,  setBusinessLogo]  = useState(null)

  useEffect(() => {
    if (isBusiness) {
      getMyBusiness().then((b) => setBusinessLogo(b.logo_url || null)).catch(() => {})
    }
  }, [isBusiness])

  const Layout = isBusiness ? BusinessLayout : ClientLayout

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setLogoutLoading(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <Layout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isBusiness ? 'Mi Negocio' : 'Configuración'}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">Gestiona tu cuenta y preferencias.</p>
      </section>

      <div className="max-w-lg space-y-6">

        {/* ── Profile card ── */}
        <div
          className={`flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm ${!isBusiness ? 'cursor-pointer transition-colors hover:bg-neutral-50' : ''}`}
          onClick={!isBusiness ? () => navigate('/profile') : undefined}
          role={!isBusiness ? 'button' : undefined}
        >
          {(businessLogo || user?.avatarUrl || user?.avatar_url) ? (
            <img
              src={businessLogo || user.avatarUrl || user.avatar_url}
              alt={user.name}
              className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-neutral-100"
            />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-600">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-neutral-900">{user?.name || 'Usuario'}</p>
            <p className="truncate text-sm text-neutral-400">{user?.email}</p>
            {user?.phone && <p className="mt-0.5 text-xs text-neutral-400">{user.phone}</p>}
            {isBusiness && (
              <span className="mt-2 inline-block rounded-lg bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-600">
                Cuenta de Negocio
              </span>
            )}
          </div>
          {!isBusiness && <ChevronIcon />}
        </div>

        {/* ── Cuenta (solo clientes) ── */}
        {!isBusiness && (
          <div>
            <SectionLabel>Cuenta</SectionLabel>
            <SettingsGroup>
              <SettingsTile icon={<UserIcon />} label="Editar Perfil" to="/profile" />
            </SettingsGroup>
          </div>
        )}

        {/* ── Mi Negocio (solo business owners) ── */}
        {isBusiness && (
          <div>
            <SectionLabel>Mi Negocio</SectionLabel>
            <SettingsGroup>
              <SettingsTile icon={<EditIcon />} label="Configuración del Negocio" to="/business/edit" />
              <SettingsTile icon={<QRIcon />}  label="Código QR del Negocio"     to="/business/qr" />
            </SettingsGroup>
          </div>
        )}

        {/* ── Soporte ── */}
        <div>
          <SectionLabel>Soporte</SectionLabel>
          <SettingsGroup>
            <SettingsTile icon={<HelpIcon />}   label="Centro de Ayuda"        to="/help" />
            <SettingsTile icon={<ShieldIcon />} label="Política de Privacidad" to="/privacy-policy" />
          </SettingsGroup>
        </div>

        {/* ── Logout ── */}
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-100"
        >
          <LogoutIcon />
          Cerrar sesión
        </button>

        <p className="pb-4 text-center text-xs text-neutral-300">Bookio v1.0.0</p>
      </div>

      {showLogout && (
        <LogoutModal
          loading={logoutLoading}
          onConfirm={handleLogout}
          onClose={() => setShowLogout(false)}
        />
      )}
    </Layout>
  )
}
