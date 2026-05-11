import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import AuthLayout from '../../layouts/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'
import GoogleButton from '../../components/auth/GoogleButton'
import Divider from '../../components/ui/Divider'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../lib/firebase'

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Ingresa tu correo.'); return }
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setSent(true)
    } catch {
      setError('No se encontró una cuenta con ese correo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-bold text-neutral-900">Recuperar contraseña</h3>
        {sent ? (
          <>
            <p className="mt-3 text-sm text-neutral-600">
              Enviamos un correo a <strong>{email}</strong>. Revisa tu bandeja de entrada.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              Cerrar
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-neutral-500">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const handleGoogle = async () => {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      const user = await loginWithGoogle()
      navigate(user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard')
    } catch (err) {
      if (err?.response?.status === 404) {
        setGoogleError('No tienes una cuenta. Regístrate primero.')
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // user cancelled — do nothing
      } else {
        setGoogleError('No se pudo iniciar sesión con Google.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
          Bienvenido de vuelta
        </h1>
        <p className="text-sm text-neutral-500">
          Ingresa tus datos para continuar.
        </p>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} />

      {googleError && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{googleError}</p>
      )}

      <Divider className="my-6">o continúa con correo</Divider>

      <LoginForm />

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="text-sm text-neutral-500 underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-neutral-500">
        ¿No tienes una cuenta?{' '}
        <Link
          to="/signup/client"
          className="font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </AuthLayout>
  )
}
