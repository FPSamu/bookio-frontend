import api from './api'

const TYPE_MAP = {
  RESTAURANT: 'restaurant', SPA: 'spa', SALON: 'salon',
  BARBERSHOP: 'barbershop', MEDICAL: 'medical', OTHER: 'other',
}

function transformFavorite(f) {
  const b = f.business || {}
  const photos = Array.isArray(b.photos) ? b.photos : []
  return {
    id: b.id || f.id,
    favoriteId: f.id,
    name: b.name || '',
    type: TYPE_MAP[b.type] || 'other',
    category: b.type ? b.type.charAt(0) + b.type.slice(1).toLowerCase() : '',
    rating: b.average_rating ?? 0,
    reviewCount: b.review_count ?? 0,
    imageUrl: photos[0] || b.logo_url || null,
    location: b.address || '',
    tags: [],
    isOpen: null,
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
