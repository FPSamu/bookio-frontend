export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Panel izquierdo: branding ────────────────────────────────── */}
      <aside className="hidden md:flex md:w-[45%] flex-col justify-between bg-neutral-950 px-10 py-12 text-white">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <span className="text-xs font-bold text-neutral-950">B</span>
          </div>
          <span className="text-lg font-bold tracking-tight">Bookio</span>
        </div>

        {/* Cuerpo central: tagline + decoración */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Para restaurantes y clientes
            </p>
            <h2 className="text-4xl font-bold leading-tight lg:text-5xl">
              Reservas sin
              <br />
              complicaciones.
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              Gestiona o realiza reservas en pocos pasos.
              Sin llamadas, sin esperas.
            </p>
          </div>

          {/* Tarjeta decorativa: simula una reserva activa */}
          <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                Próxima reserva
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                Confirmada
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-semibold">Restaurante El Origen</p>
              <p className="text-sm text-neutral-400">Hoy · 8:30 PM · 2 personas</p>
            </div>
            <div className="h-px w-full bg-neutral-800" />
            <div className="flex items-center gap-2">
              {/* Avatar stack decorativo */}
              {['A', 'B'].map((letter, i) => (
                <span
                  key={letter}
                  style={{ marginLeft: i === 0 ? 0 : '-8px' }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-900 bg-neutral-700 text-xs font-bold"
                >
                  {letter}
                </span>
              ))}
              <span className="ml-1 text-xs text-neutral-400">
                Mesa confirmada
              </span>
            </div>
          </div>
        </div>

        {/* Footer del panel */}
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Bookio. Todos los derechos reservados.
        </p>
      </aside>

      {/* ── Panel derecho: formulario ─────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">

        {/* Logo visible solo en mobile (el panel izquierdo está oculto) */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950">
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Bookio
          </span>
        </div>

        {/* Slot del formulario */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

    </div>
  )
}
