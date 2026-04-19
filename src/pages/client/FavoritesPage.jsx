import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ClientLayout from '../../layouts/ClientLayout'
import FavoriteGrid from '../../components/favorites/FavoriteGrid'
import SectionTitle from '../../components/ui/SectionTitle'
import { getFavorites, removeFavorite } from '../../services/favorites'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchFavorites() {
      setLoading(true)
      try {
        const data = await getFavorites()
        if (!cancelled) setFavorites(data)
      } catch (err) {
        console.error('Error cargando favoritos:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFavorites()
    return () => { cancelled = true }
  }, [])

  const handleRemove = async (business) => {
    try {
      await removeFavorite(business.favoriteId)
      setFavorites((prev) => prev.filter((b) => b.id !== business.id))
    } catch (err) {
      console.error('Error eliminando favorito:', err)
    }
  }

  const handleReserve = (business) => {
    navigate(`/booking/${business.id}`)
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
