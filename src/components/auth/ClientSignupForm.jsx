import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../ui/InputField'
import PasswordInput from '../ui/PasswordInput'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

function validate(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido.'
  }

  if (!form.email) {
    errors.email = 'El correo es requerido.'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida.'
  } else if (form.password.length < 8) {
    errors.password = 'Mínimo 8 caracteres.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}

export default function ClientSignupForm() {
  const { registerWithEmail } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await registerWithEmail({ ...form, role: 'CLIENT' })
      navigate('/dashboard')
    } catch (err) {
      setApiError(resolveFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {apiError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p>
      )}

      <InputField
        id="client-name"
        label="Nombre completo"
        type="text"
        placeholder="Juan Pérez"
        value={form.name}
        onChange={set('name')}
        error={errors.name}
        autoComplete="name"
        required
      />

      <InputField
        id="client-email"
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
        required
      />

      <PasswordInput
        id="client-password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <PasswordInput
        id="client-confirm-password"
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Button type="submit" fullWidth disabled={loading} className="mt-1">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}

function resolveFirebaseError(err) {
  const map = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email':        'El correo no es válido.',
    'auth/weak-password':        'La contraseña es muy débil.',
  }
  return map[err?.code] ?? 'Ocurrió un error. Intenta de nuevo.'
}
