import { useState } from 'react'
import InputField from './InputField'

function EyeIcon({ open }) {
  return open ? (
    // ojo abierto
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // ojo cerrado
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function PasswordInput({
  id,
  label = 'Contraseña',
  placeholder = '••••••••',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  autoComplete = 'current-password',
  className = '',
}) {
  const [visible, setVisible] = useState(false)

  return (
    <InputField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      className={className}
    >
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-neutral-400 hover:text-neutral-700 transition-colors duration-150 focus:outline-none"
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <EyeIcon open={visible} />
      </button>
    </InputField>
  )
}
