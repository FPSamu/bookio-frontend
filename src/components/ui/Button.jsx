export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  icon,
  onClick,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

  const variants = {
    primary:
      'px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-700 active:scale-[0.98]',
    secondary:
      'px-6 py-3 border-[1.5px] border-neutral-900 text-neutral-900 bg-transparent hover:bg-neutral-100 active:scale-[0.98]',
    text: 'px-0 py-0 text-neutral-900 bg-transparent underline-offset-4 hover:underline',
  }

  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${width} ${className}`}
    >
      {children}
      {icon && <span className="flex-shrink-0">{icon}</span>}
    </button>
  )
}
