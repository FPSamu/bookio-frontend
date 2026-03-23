export default function InputField({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  inputRef,
  children, 
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-neutral-700 select-none"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={[
            'w-full rounded-lg border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400',
            'transition-colors duration-150 outline-none',
            'focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-neutral-300',
            disabled ? 'bg-neutral-100 cursor-not-allowed opacity-60' : 'bg-white',
            children ? 'pr-11' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {/* slot para ícono o acción dentro del input (ej. ojo de contraseña) */}
        {children && (
          <div className="absolute right-3 flex items-center">{children}</div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 leading-snug">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-neutral-400 leading-snug">{helperText}</p>
      )}
    </div>
  )
}
