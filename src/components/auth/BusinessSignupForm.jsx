import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../ui/InputField'
import PasswordInput from '../ui/PasswordInput'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

function validate(form) {
  const errors = {}

  if (!form.contactName.trim())  errors.contactName  = 'El nombre de contacto es requerido.'

  if (!form.email) {
    errors.email = 'El correo es requerido.'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'El teléfono es requerido.'
  } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) {
    errors.phone = 'Ingresa un teléfono válido.'
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

export default function BusinessSignupForm() {
  const { registerWithEmail } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    contactName:  '',
    email:        '',
    phone:        '',
    password:     '',
    confirmPassword: '',
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
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
      await registerWithEmail({
        email:    form.email,
        password: form.password,
        role:     'BUSINESS_OWNER',
        name:     form.contactName,
        phone:    form.phone,
      })
      // Account created! Now proceed to business setup.
      navigate('/business/setup')
    } catch (err) {
      setApiError(resolveFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="mb-2">
        <p className="text-sm text-neutral-500">
          Primero crea tu cuenta personal para administrar tu negocio.
        </p>
      </div>

      {apiError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p>
      )}

      <InputField
        id="business-contact"
        label="Nombre de contacto"
        type="text"
        placeholder="Juan Pérez"
        value={form.contactName}
        onChange={set('contactName')}
        error={errors.contactName}
        autoComplete="name"
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="business-email"
          label="Correo electrónico"
          type="email"
          placeholder="contacto@negocio.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          required
        />
        <InputField
          id="business-phone"
          label="Teléfono"
          type="tel"
          placeholder="+52 55 0000 0000"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          autoComplete="tel"
          required
        />
      </div>

      <PasswordInput
        id="business-password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <PasswordInput
        id="business-confirm-password"
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Button type="submit" fullWidth disabled={loading} className="mt-2 py-3 text-base">
        {loading ? 'Creando cuenta...' : 'Continuar al negocio'}
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
