import api from './api'

let _businessCache = null

const MX_TZ = 'America/Mexico_City'

function isOpenNow(schedules) {
  if (!schedules || schedules.length === 0) return false
  const mxNow   = new Date(new Date().toLocaleString('en-US', { timeZone: MX_TZ }))
  const todayDow = mxNow.getDay()
  const curMin   = mxNow.getHours() * 60 + mxNow.getMinutes()
  const entry    = schedules.find(s => s.day_of_week === todayDow)
  if (!entry) return false
  const [sH, sM] = (entry.start_time || '00:00').split(':').map(Number)
  const [eH, eM] = (entry.end_time   || '00:00').split(':').map(Number)
  return curMin >= sH * 60 + sM && curMin < eH * 60 + eM
}

const TYPE_MAP = {
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  SALON: 'salon',
  BARBERSHOP: 'barbershop',
  MEDICAL: 'medical',
  OTHER: 'other',
}

function toFrontendType(backendType = '') {
  return TYPE_MAP[backendType] || 'other'
}

function transformBusiness(b) {
  const photos = Array.isArray(b.photos) ? b.photos : []
  return {
    id: b.id,
    name: b.name,
    type: toFrontendType(b.type),
    category: b.type ? b.type.charAt(0) + b.type.slice(1).toLowerCase() : '',
    rating: b.average_rating ?? 0,
    reviewCount: b.review_count ?? 0,
    imageUrl: photos[0] || b.logo_url || null,
    photos,
    location: b.address || '',
    lat: b.latitude  ?? null,
    lng: b.longitude ?? null,
    phone: b.phone   || null,
    tags: [],
    isOpen: null,
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
  spa:        'SPA',
  salon:      'SALON',
  barbershop: 'BARBERSHOP',
  medical:    'MEDICAL',
  other:      'OTHER',
}

export async function registerBusiness({ name, type, address, lat, lng }) {
  const { data } = await api.post('/businesses', {
    name,
    type: FRONTEND_TO_BACKEND_TYPE[type] || type.toUpperCase(),
    address: address || undefined,
    latitude: lat !== undefined ? Number(lat) : undefined,
    longitude: lng !== undefined ? Number(lng) : undefined,
  })
  return data
}

export async function getBusinessById(businessId) {
  const { data } = await api.get(`/businesses/${businessId}`)
  const b = data.business || data
  const photos = Array.isArray(b.photos) ? b.photos : []
  const schedules = Array.isArray(b.schedules) ? b.schedules : []
  return {
    id: b.id,
    name: b.name,
    type: toFrontendType(b.type),
    rawType: b.type || '',
    category: b.type ? b.type.charAt(0) + b.type.slice(1).toLowerCase() : '',
    rating: b.average_rating ?? 0,
    reviewCount: b.review_count ?? 0,
    logoUrl: b.logo_url || null,
    imageUrl: photos[0] || b.logo_url || null,
    photos,
    location: b.address || '',
    lat: b.latitude  ?? null,
    lng: b.longitude ?? null,
    phone: b.phone || null,
    tags: [],
    isOpen: schedules.length > 0 ? isOpenNow(schedules) : null,
  }
}

export async function getBusinessServices(businessId) {
  const { data } = await api.get(`/businesses/${businessId}/services`)
  return data.services || data.data || []
}

export async function getBusinessSchedule(businessId) {
  const { data } = await api.get(`/schedules/business/${businessId}`)
  return data.schedules || data.data || []
}

export async function updateBusiness({ name, type, address, phone, photos, latitude, longitude }) {
  const body = { name }
  if (type) body.type = FRONTEND_TO_BACKEND_TYPE[type] || type.toUpperCase()
  if (address !== undefined) body.address = address
  if (phone !== undefined) body.phone = phone
  if (photos !== undefined) body.photos = photos
  if (latitude !== undefined) body.latitude = latitude
  if (longitude !== undefined) body.longitude = longitude
  const { data } = await api.put('/businesses/mine', body)
  clearBusinessCache()
  return data
}

export async function uploadBusinessLogo(file) {
  const formData = new FormData()
  formData.append('logo', file)
  const { data } = await api.patch('/businesses/mine/logo', formData)
  clearBusinessCache()
  return data.logo_url
}

export async function uploadBusinessPhotos(files) {
  const formData = new FormData()
  files.forEach((f) => formData.append('photos', f))
  const { data } = await api.put('/businesses/mine/photos', formData)
  clearBusinessCache()
  return data.photos || []
}

export async function getBusinessReviews(businessId) {
  const { data } = await api.get(`/reviews/business/${businessId}`)
  return data.reviews || data.data || []
}
