import { useState } from 'react'
import InputField from '../ui/InputField'
import PasswordInput from '../ui/PasswordInput'
import Button from '../ui/Button'

function validate(form) {
  const errors = {}

  if (!form.restaurantName.trim()) {
    errors.restaurantName = 'El nombre del restaurante es requerido.'
  }

  if (!form.contactName.trim()) {
    errors.contactName = 'El nombre de contacto es requerido.'
  }

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

export default function RestaurantSignupForm() {
  const [form, setForm] = useState({
    restaurantName: '',
    contactName: '',
    email: '',
    phone: '',
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
    // TODO: llamada a la API — registro de restaurante
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <InputField
        id="restaurant-name"
        label="Nombre del restaurante"
        type="text"
        placeholder="El Origen"
        value={form.restaurantName}
        onChange={set('restaurantName')}
        error={errors.restaurantName}
        autoComplete="organization"
        required
      />

      <InputField
        id="restaurant-contact"
        label="Nombre de contacto"
        type="text"
        placeholder="Juan Pérez"
        value={form.contactName}
        onChange={set('contactName')}
        error={errors.contactName}
        autoComplete="name"
        required
      />

      {/* Email y teléfono en fila desde sm en adelante */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          id="restaurant-email"
          label="Correo electrónico"
          type="email"
          placeholder="contacto@restaurante.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          required
        />

        <InputField
          id="restaurant-phone"
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
        id="restaurant-password"
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <PasswordInput
        id="restaurant-confirm-password"
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Button type="submit" fullWidth disabled={loading} className="mt-1">
        {loading ? 'Creando cuenta...' : 'Registrar restaurante'}
      </Button>
    </form>
  )
}
