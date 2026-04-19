import api from './api'

function transformFavorite(f) {
  const b = f.business || {}
  return {
    id: b.id || f.id,
    favoriteId: f.id,
    name: b.name || '',
    category: b.type ? b.type.charAt(0) + b.type.slice(1).toLowerCase() : '',
    rating: b.average_rating ?? 0,
    reviewCount: b.review_count ?? 0,
    imageUrl: b.logo_url || null,
    location: b.address || '',
    tags: [],
    isOpen: true,
  }
}

export async function getFavorites() {
  const { data } = await api.get('/favorites')
  return (data.favorites || []).map(transformFavorite)
}

export async function addFavorite(businessId) {
  const { data } = await api.post('/favorites', { businessId })
  return data
}

export async function removeFavorite(favoriteId) {
  const { data } = await api.delete(`/favorites/${favoriteId}`)
  return data
}
