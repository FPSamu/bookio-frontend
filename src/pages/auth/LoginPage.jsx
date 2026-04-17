import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'
import GoogleButton from '../../components/auth/GoogleButton'
import Divider from '../../components/ui/Divider'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

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

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿No tienes una cuenta?{' '}
        <Link
          to="/signup/client"
          className="font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
