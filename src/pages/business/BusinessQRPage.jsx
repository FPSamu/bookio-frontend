import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import BusinessLayout from '../../layouts/BusinessLayout'
import { getMyBusiness } from '../../services/businesses'

export default function BusinessQRPage() {
  const [business, setBusiness] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false
    getMyBusiness()
      .then((biz) => { if (!cancelled) setBusiness(biz) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <BusinessLayout>
        <div className="flex justify-center pt-20">
          <div className="h-56 w-56 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      </BusinessLayout>
    )
  }

  if (!business) {
    return (
      <BusinessLayout>
        <p className="text-center text-sm text-neutral-400 pt-20">No se pudo cargar el negocio.</p>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Mi QR</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Comparte este código para que tus clientes puedan encontrar y reservar tu negocio.
        </p>
      </section>

      <div className="flex flex-col items-center gap-6">
        {/* QR Card */}
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-neutral-100"
            />
          )}
          <div className="text-center">
            <p className="text-lg font-bold text-neutral-900">{business.name}</p>
            {business.type && (
              <p className="text-sm text-neutral-400 capitalize">{business.type.toLowerCase()}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-neutral-100">
            <QRCodeSVG
              value={business.id}
              size={220}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-neutral-400">ID del negocio</p>
            <code className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-mono text-neutral-600">
              {business.id}
            </code>
          </div>
        </div>

        <p className="max-w-xs text-center text-sm text-neutral-400">
          El cliente escanea este QR con la app de Bookio para reservar directamente en tu negocio.
        </p>
      </div>
    </BusinessLayout>
  )
}
