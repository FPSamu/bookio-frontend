import { useAuth } from '../../context/AuthContext'
import ClientLayout from '../../layouts/ClientLayout'
import BusinessLayout from '../../layouts/BusinessLayout'

const SECTIONS = [
  {
    title: '1. Información que recopilamos',
    body: `Al registrarte en Bookio recopilamos:
• Nombre completo y correo electrónico
• Número de teléfono (opcional)
• Foto de perfil (si inicias sesión con Google)
• Historial de citas y negocios visitados`,
  },
  {
    title: '2. Cómo usamos tu información',
    body: `Usamos tu información para:
• Crear y gestionar tu cuenta
• Permitirte agendar citas con negocios registrados
• Enviarte recordatorios de tus citas (solo con tu permiso)
• Mejorar la experiencia dentro de la plataforma`,
  },
  {
    title: '3. Compartir información',
    body: `No vendemos ni compartimos tu información personal con terceros, excepto:
• Con los negocios en los que reserves citas (nombre y contacto básico)
• Cuando sea requerido por ley
• Con proveedores de servicios técnicos bajo acuerdos de confidencialidad (Firebase, AWS)`,
  },
  {
    title: '4. Almacenamiento y seguridad',
    body: 'Tu información se almacena en servidores protegidos. Las contraseñas son gestionadas por Firebase Authentication y nunca se almacenan en texto plano.',
  },
  {
    title: '5. Tus derechos',
    body: `Tienes derecho a:
• Acceder, corregir o eliminar tu información personal
• Revocar permisos de notificaciones en cualquier momento
• Solicitar la eliminación de tu cuenta escribiendo a soporte@bookio.app`,
  },
  {
    title: '6. Cookies y rastreo',
    body: 'Bookio no utiliza cookies de rastreo publicitario. Únicamente usamos tokens de sesión necesarios para el funcionamiento de la plataforma.',
  },
  {
    title: '7. Menores de edad',
    body: 'Bookio no está dirigida a menores de 13 años. No recopilamos intencionalmente información de menores.',
  },
  {
    title: '8. Cambios a esta política',
    body: 'Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios importantes a través de la plataforma.',
  },
  {
    title: '9. Contacto',
    body: `Para preguntas sobre privacidad:
📧 privacidad@bookio.app
📍 Zapopan, Jalisco, México`,
  },
]

function Section({ title, body }) {
  return (
    <div className="pb-6">
      <h3 className="mb-2 text-sm font-bold text-neutral-900">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-500">{body}</p>
    </div>
  )
}

function Content() {
  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="mb-6 text-xs text-neutral-400">Última actualización: Mayo 2025</p>
        <div className="divide-y divide-neutral-50">
          {SECTIONS.map(s => (
            <Section key={s.title} title={s.title} body={s.body} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  const { user } = useAuth()
  const isBusiness = user?.role === 'BUSINESS_OWNER'

  const Layout = isBusiness ? BusinessLayout : ClientLayout

  return (
    <Layout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Política de Privacidad</h1>
        <p className="mt-1 text-sm text-neutral-400">Cómo protegemos y usamos tu información.</p>
      </section>
      <Content />
    </Layout>
  )
}
