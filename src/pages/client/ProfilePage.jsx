import { useState, useRef } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, uploadAvatar } from '../../services/users'

function UserCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-neutral-300" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const avatarInputRef = useRef(null)

  const [name,           setName]           = useState(user?.name  || '')
  const [phone,          setPhone]          = useState(user?.phone || '')
  const [avatarPreview,  setAvatarPreview]  = useState(user?.avatarUrl || user?.avatar_url || null)
  const [avatarFile,     setAvatarFile]     = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState(false)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    setAvatarFile(file)
    setUploadingAvatar(true)
    try {
      await uploadAvatar(file)
      await refreshUser()
    } catch (err) {
      setAvatarPreview(user?.avatarUrl || user?.avatar_url || null)
      setError(err?.response?.data?.error || 'No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError('')
    setSaving(true)
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() })
      await refreshUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('No se pudieron guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ClientLayout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-neutral-400">Actualiza tu información personal.</p>
      </section>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 transition-opacity hover:opacity-80 disabled:opacity-50"
              title="Cambiar foto de perfil"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserCircleIcon />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <svg className="animate-spin h-5 w-5 text-neutral-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}
            </button>
            <p className="text-xs text-neutral-400">Toca para cambiar foto</p>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">¡Perfil actualizado correctamente!</div>
          )}

          {/* ── Campos ── */}
          <InputField
            id="profile-name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <InputField
            id="profile-email"
            label="Correo electrónico"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="El correo no puede modificarse."
          />
          <InputField
            id="profile-phone"
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+52 55 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </div>
    </ClientLayout>
  )
}
