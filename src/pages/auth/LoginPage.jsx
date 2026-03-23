import { Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'
import Divider from '../../components/ui/Divider'

export default function LoginPage() {
  return (
    <AuthLayout>
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
          Bienvenido de vuelta
        </h1>
        <p className="text-sm text-neutral-500">
          Ingresa tus datos para continuar.
        </p>
      </div>

      <LoginForm />

      <Divider className="my-6" />

      {/* Footer: ir a signup */}
      <p className="text-center text-sm text-neutral-500">
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
