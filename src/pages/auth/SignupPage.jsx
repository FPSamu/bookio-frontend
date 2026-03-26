import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import AccountTypeSelector from '../../components/auth/AccountTypeSelector'
import ClientSignupForm from '../../components/auth/ClientSignupForm'
import BusinessSignupForm from '../../components/auth/BusinessSignupForm'
import Divider from '../../components/ui/Divider'

const VALID_TYPES = ['client', 'business']

// ── Página ────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { type } = useParams()
  const navigate = useNavigate()

  if (!VALID_TYPES.includes(type)) {
    return <Navigate to="/signup/client" replace />
  }

  const handleTypeChange = (newType) => {
    navigate(`/signup/${newType}`, { replace: true })
  }

  return (
    <AuthLayout>

      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
          Crear una cuenta
        </h1>
        <p className="text-sm text-neutral-500">
          Elige el tipo de cuenta que necesitas.
        </p>
      </div>

      {/* Selector de tipo de cuenta */}
      <AccountTypeSelector value={type} onChange={handleTypeChange} />

      <Divider className="my-6" />

      {/* Formularios */}
      <div className={type === 'client' ? 'block' : 'hidden'}>
        <ClientSignupForm />
      </div>
      <div className={type === 'business' ? 'block' : 'hidden'}>
        <BusinessSignupForm />
      </div>

      {/* Footer: ir a login */}
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
