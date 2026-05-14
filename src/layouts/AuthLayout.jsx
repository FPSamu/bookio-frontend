import { useState, useEffect, useRef } from 'react'

// ── Slide 1: booking card ─────────────────────────────────────────────────────

function SlideBooking({ visible }) {
  return (
    <div className={`flex flex-col gap-7 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none absolute'}`}>
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Restaurantes · Spas · Salones · Médicos
        </p>
        <h2 className="text-5xl font-black leading-[1.05] lg:text-6xl text-white">
          Tu cita,<br />en segundos.
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
          Reserva en restaurantes, spas, barberías, salones y consultorios médicos.
          Sin llamadas, sin filas, sin esperas.
        </p>
      </div>

      {/* Tarjeta decorativa */}
      <div className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Próxima reserva</span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            Confirmada
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-white">Spa Serenity</p>
          <p className="text-sm text-neutral-400">Hoy · 3:00 PM · Masaje relajante</p>
        </div>
        <div className="h-px w-full bg-neutral-800" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Duración estimada</span>
          <span className="text-xs font-semibold text-neutral-300">60 minutos</span>
        </div>
      </div>
    </div>
  )
}

// ── Slide 2: app store ────────────────────────────────────────────────────────

const DEFAULT_IMG = 'https://i.imgur.com/O7tmPVS.png'

function SlideAppStore({ visible }) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setEntered(true), 50)
      return () => clearTimeout(t)
    } else {
      setEntered(false)
    }
  }, [visible])

  return (
    <div className={`flex flex-col gap-6 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none absolute'}`}>
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Aplicación móvil · iOS
        </p>
        <h2 className="text-5xl font-black leading-[1.05] lg:text-6xl text-white">
          Bookio,<br />en tu bolsillo.
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
          Gestiona reservas, escanea QR y atiende a tus clientes desde donde estés.
        </p>
      </div>

      {/* iPhone Frame + App Store badge */}
      <div className="flex items-center gap-8">

        {/* iPhone Mockup */}
        <div
          className={`relative flex-shrink-0 transition-all duration-700 ease-out ${entered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'}`}
          style={{ width: 140 }}
        >
          {/* Phone Frame */}
          <div className="relative overflow-hidden rounded-[32px] border-[4px] border-neutral-800 bg-neutral-900 shadow-2xl shadow-white/5"
            style={{ width: 140, height: 285 }}>

            {/* Screen Content */}
            <div className="absolute inset-[1px] overflow-hidden rounded-[29px] bg-neutral-800">
              <img src={DEFAULT_IMG} alt="App preview" className="h-full w-full object-cover object-top" />
            </div>

            {/* Subtle Reflection */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        </div>

        {/* App Store Badge */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">

            <a href="#"
              className="flex w-fit items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                fill="#000" className="flex-shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.79.03 3.02 2.65 4.03 2.68 4.04l-.07.25zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="leading-tight">
                <p className="text-[9px] text-neutral-500">Disponible en</p>
                <p className="text-sm font-black text-black">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

const SLIDES = [0, 1]
const INTERVAL = 10000

export default function AuthLayout({ children }) {
  const [slide, setSlide] = useState(0)
  const timer = useRef(null)

  function resetTimer() {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), INTERVAL)
  }

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timer.current)
  }, []) // eslint-disable-line

  function goTo(i) {
    setSlide(i)
    resetTimer()
  }

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Left Panel (Sticky Sidebar) ── */}
      <aside className="hidden md:flex md:w-[50%] h-screen sticky top-0 flex-col justify-between bg-neutral-950 px-16 py-14 text-white overflow-hidden">

        {/* Background glows */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />

        {/* Logo — text only, extra big */}
        <div className="relative">
          <span className="text-5xl font-black tracking-tighter text-white">Bookio</span>
        </div>

        {/* Slides centered vertically */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="relative w-full">
            <SlideBooking visible={slide === 0} />
            <SlideAppStore visible={slide === 1} />
          </div>
        </div>

        {/* Dots + copyright */}
        <div className="relative flex items-center justify-between">
          <div className="flex gap-2">
            {SLIDES.map(i => (
              <button key={i} type="button" onClick={() => goTo(i)}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  i === slide ? 'w-8 bg-white' : 'w-1.5 bg-white/25 hover:bg-white/40',
                ].join(' ')}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-700 font-medium">© {new Date().getFullYear()} Bookio</p>
        </div>
      </aside>

      {/* ── Right Panel: Form ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12 bg-white">

        {/* Logo mobile */}
        <div className="mb-12 md:hidden">
          <span className="text-4xl font-black tracking-tight text-neutral-900">Bookio</span>
        </div>

        {/* Form container */}
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>

    </div>
  )
}
