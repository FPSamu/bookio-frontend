export default function AuthCard({ title, subtitle, children, className = '' }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className={`w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-10 ${className}`}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 tracking-tight">
            Bookio
          </span>
        </div>

        {/* Encabezado */}
        {(title || subtitle) && (
          <div className="mb-6 flex flex-col gap-1">
            {title && (
              <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm leading-relaxed text-neutral-500">{subtitle}</p>
            )}
          </div>
        )}

        {/* Contenido del formulario */}
        {children}
      </div>
    </div>
  )
}
