import { useState } from 'react'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AccountTypeSelector from '../../components/auth/AccountTypeSelector'
import ClientSignupForm from '../../components/auth/ClientSignupForm'
import BusinessSignupForm from '../../components/auth/BusinessSignupForm'
import GoogleButton from '../../components/auth/GoogleButton'
import Divider from '../../components/ui/Divider'
import { useAuth } from '../../context/AuthContext'

const VALID_TYPES = ['client', 'business']
const ROLE_MAP    = { client: 'CLIENT', business: 'BUSINESS_OWNER' }

export default function SignupPage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()

  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError,   setGoogleError]   = useState('')

  if (!VALID_TYPES.includes(type)) {
    return <Navigate to="/signup/client" replace />
  }

  const handleTypeChange = (newType) => {
    navigate(`/signup/${newType}`, { replace: true })
  }

  const handleGoogle = async () => {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      const role = ROLE_MAP[type]
      const user = await loginWithGoogle(role)
      navigate(user.role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/dashboard')
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setGoogleError('No se pudo registrar con Google. Intenta de nuevo.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
          Crear una cuenta
        </h1>
        <p className="text-sm text-neutral-500">
          Elige el tipo de cuenta que necesitas.
        </p>
      </div>

      <AccountTypeSelector value={type} onChange={handleTypeChange} />

      <div className="mt-6">
        <GoogleButton onClick={handleGoogle} loading={googleLoading} />
        {googleError && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{googleError}</p>
        )}
      </div>

      <Divider className="my-6">o regístrate con correo</Divider>

      <div className={type === 'client' ? 'block' : 'hidden'}>
        <ClientSignupForm />
      </div>
      <div className={type === 'business' ? 'block' : 'hidden'}>
        <BusinessSignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿Ya tienes una cuenta?{' '}
        <Link
          to="/login"
          className="font-semibold text-neutral-900 underline-offset-4 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
