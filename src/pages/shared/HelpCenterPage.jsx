import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ClientLayout from '../../layouts/ClientLayout'
import BusinessLayout from '../../layouts/BusinessLayout'

const FAQS = [
  {
    question: '¿Cómo agendo una cita?',
    answer: 'Explora la pantalla de inicio o busca un negocio por categoría. Al entrar al detalle, selecciona un servicio y elige el día y horario disponible. Confirma la reserva y recibirás un código QR de confirmación.',
  },
  {
    question: '¿Puedo cancelar mi cita?',
    answer: 'Sí. Entra a "Mis Reservas", selecciona la cita y toca "Cancelar cita" al final de la pantalla. Solo puedes cancelar citas futuras.',
  },
  {
    question: '¿Cómo califico un servicio?',
    answer: 'Una vez que tu cita haya pasado, ábrela desde "Mis Reservas". Si no fue cancelada, verás el formulario para dejar tu reseña y calificación.',
  },
  {
    question: '¿Cómo guardo un negocio en favoritos?',
    answer: 'En la pantalla de detalle del negocio, toca el ícono de corazón. Lo encontrarás después en la pestaña "Favoritos".',
  },
  {
    question: '¿El código QR es necesario?',
    answer: 'El QR sirve como comprobante de tu reserva. Muéstralo al llegar al establecimiento para agilizar tu atención.',
  },
  {
    question: '¿Cómo cambio mi información de perfil?',
    answer: 'Ve a Configuración → Editar Perfil. Puedes actualizar tu nombre, foto y número de teléfono. El correo electrónico no es editable.',
  },
  {
    question: '¿Bookio cobra alguna comisión?',
    answer: 'Bookio es una plataforma gratuita para usuarios. Los precios que ves son los que cobra directamente el negocio.',
  },
]

function ChevronIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-neutral-900">{question}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="border-t border-neutral-50 px-5 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-neutral-500">{answer}</p>
        </div>
      )}
    </div>
  )
}

function AgentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-neutral-400" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function Content() {
  return (
    <div className="max-w-2xl">
      {/* Hero */}
      <div className="mb-8 flex items-center gap-5 rounded-2xl bg-neutral-900 p-6">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <AgentIcon />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">¿En qué podemos ayudarte?</h2>
          <p className="mt-1 text-sm text-neutral-400">Respuestas rápidas a las preguntas más frecuentes.</p>
        </div>
      </div>

      {/* FAQ */}
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Preguntas frecuentes</p>
      <div className="flex flex-col gap-2">
        {FAQS.map(f => <FaqItem key={f.question} question={f.question} answer={f.answer} />)}
      </div>

      {/* Contact */}
      <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
        <MailIcon />
        <p className="mt-2 font-bold text-neutral-900">¿No encontraste tu respuesta?</p>
        <a href="mailto:soporte@bookio.app" className="text-sm font-semibold text-neutral-700 underline underline-offset-4">
          soporte@bookio.app
        </a>
        <p className="text-xs text-neutral-400">Respondemos en menos de 24 horas.</p>
      </div>
    </div>
  )
}

export default function HelpCenterPage() {
  const { user } = useAuth()
  const isBusiness = user?.role === 'BUSINESS_OWNER'

  const Layout = isBusiness ? BusinessLayout : ClientLayout

  return (
    <Layout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Centro de Ayuda</h1>
        <p className="mt-1 text-sm text-neutral-400">Encuentra respuestas rápidas.</p>
      </section>
      <Content />
    </Layout>
  )
}
