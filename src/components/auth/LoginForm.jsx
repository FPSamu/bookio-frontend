import { useState } from 'react'
import InputField from '../ui/InputField'
import PasswordInput from '../ui/PasswordInput'
import Button from '../ui/Button'

function validate(form) {
  const errors = {}
  if (!form.email) {
    errors.email = 'El correo es requerido.'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  }
  if (!form.password) {
    errors.password = 'La contraseña es requerida.'
  }
  return errors
}

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
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
    // TODO: llamada a la API
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <InputField
        id="login-email"
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
        required
      />

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="login-password"
          label="Contraseña"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-neutral-400 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={loading} className="mt-1">
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
