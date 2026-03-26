import { useState } from 'react'
import ClientLayout from '../../layouts/ClientLayout'
import FavoriteGrid from '../../components/favorites/FavoriteGrid'
import SectionTitle from '../../components/ui/SectionTitle'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: reemplazar con llamada a la API (GET /favorites)

const MOCK_FAVORITES = [
  {
    id: '3',
    name: 'Sushi Nami',
    category: 'Japonesa',
    rating: 4.6,
    reviewCount: 240,
    imageUrl: null,
    location: 'Polanco, CDMX',
    tags: ['Japonesa', 'Sushi', 'Omakase'],
    isOpen: true,
  },
  {
    id: '4',
    name: 'La Mar',
    category: 'Mariscos',
    rating: 4.9,
    reviewCount: 198,
    imageUrl: null,
    location: 'Col. Anzures, CDMX',
    tags: ['Mariscos', 'Ceviche', 'Pescados'],
    isOpen: true,
  },
  {
    id: '1',
    name: 'El Origen',
    category: 'Mexicana',
    rating: 4.8,
    reviewCount: 312,
    imageUrl: null,
    location: 'Col. Roma Norte, CDMX',
    tags: ['Mexicana', 'Contemporánea'],
    isOpen: true,
  },
  {
    id: '10',
    name: 'Smash House',
    category: 'Americana',
    rating: 4.5,
    reviewCount: 310,
    imageUrl: null,
    location: 'Col. Roma Sur, CDMX',
    tags: ['Americana', 'Burgers', 'Brunch'],
    isOpen: false,
  },
]

// ── Página ────────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES)
  const [loading] = useState(false) // TODO: true mientras carga la API

  const handleRemove = (business) => {
    // TODO: llamada a la API (DELETE /favorites/:businessId)
    setFavorites((prev) => prev.filter((b) => b.id !== business.id))
  }

  const handleReserve = (business) => {
    // TODO: navegar a página de detalle / modal de reserva
    console.log('Reservar:', business.name)
  }

  return (
    <ClientLayout>

      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Mis Favoritos</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Los negocios que guardaste para reservar después.
        </p>
      </section>

      {/* ── Grid de favoritos ─────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title="Guardados"
          subtitle={`${favorites.length} negocio${favorites.length !== 1 ? 's' : ''}`}
          className="mb-4"
        />
        <FavoriteGrid
          businesses={favorites}
          loading={loading}
          onReserve={handleReserve}
          onRemove={handleRemove}
        />
      </section>

    </ClientLayout>
  )
}
