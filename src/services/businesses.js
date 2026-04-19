import api from './api'

let _businessCache = null

const TYPE_MAP = {
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  SALON: 'salon',
  BARBERSHOP: 'salon',
  MEDICAL: 'medical',
  OTHER: 'other',
}

function toFrontendType(backendType = '') {
  return TYPE_MAP[backendType] || 'other'
}

function transformBusiness(b) {
  return {
    id: b.id,
    name: b.name,
    type: toFrontendType(b.type),
    category: b.type ? b.type.charAt(0) + b.type.slice(1).toLowerCase() : '',
    rating: b.average_rating ?? 0,
    reviewCount: b.review_count ?? 0,
    imageUrl: b.logo_url || null,
    location: b.address || '',
    tags: [],
    isOpen: true,
  }
}

function transformBusinessReservation(r) {
  const dt = new Date(r.start_datetime)
  const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  return {
    id: r.id,
    clientName: r.client?.name || 'Cliente',
    clientPhone: r.client?.phone || '',
    partySize: 1,
    serviceName: r.service?.name || '',
    time,
    duration: r.service?.duration_minutes || null,
    status: r.status.toLowerCase(),
    notes: '',
    date,
  }
}

export async function getBusinesses({ type, ratingGte, search, limit = 100 } = {}) {
  const params = { limit }
  if (type && type !== 'all') params.type = type
  if (ratingGte != null) params.ratingGte = ratingGte
  if (search && search.trim()) params.search = search.trim()

  const { data } = await api.get('/businesses', { params })
  return {
    businesses: (data.data || []).map(transformBusiness),
    meta: data.meta,
  }
}

export async function getRecommendedBusinesses() {
  const { data } = await api.get('/businesses/recommended')
  return (data.data || []).map(transformBusiness)
}

export async function getMetrics() {
  const { data } = await api.get('/businesses/metrics')
  return data.metrics
}

export async function getMyBusiness() {
  if (_businessCache) return _businessCache
  const { data } = await api.get('/businesses/mine')
  _businessCache = data.business
  return _businessCache
}

export function clearBusinessCache() {
  _businessCache = null
}

export async function getBusinessReservations(date) {
  const params = date ? { date } : {}
  const { data } = await api.get('/businesses/reservations', { params })
  return (data.reservations || []).map(transformBusinessReservation)
}

const FRONTEND_TO_BACKEND_TYPE = {
  restaurant: 'RESTAURANT',
  spa: 'SPA',
  salon: 'SALON',
  medical: 'MEDICAL',
  barbershop: 'BARBERSHOP',
  other: 'OTHER',
}

export async function registerBusiness({ name, type, address }) {
  const { data } = await api.post('/businesses', {
    name,
    type: FRONTEND_TO_BACKEND_TYPE[type] || type.toUpperCase(),
    address: address || undefined,
  })
  return data
}
