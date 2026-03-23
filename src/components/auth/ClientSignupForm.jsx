import { useState } from 'react'
import InputField from '../ui/InputField'
import PasswordInput from '../ui/PasswordInput'
import Button from '../ui/Button'

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    // TODO: llamada a la API — registro de cliente
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
