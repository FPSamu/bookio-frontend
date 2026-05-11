import api from './api'

const TYPE_MAP = {
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  SALON: 'salon',
  BARBERSHOP: 'salon',
  MEDICAL: 'medical',
  OTHER: 'other',
}

function transformAppointment(a) {
  const dt = new Date(a.start_datetime)
  const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  return {
    id: a.id,
    businessId:       a.business?.id         || null,
    businessName:     a.business?.name        || '',
    businessType:     TYPE_MAP[a.business?.type] || 'other',
    businessCategory: a.business?.type
      ? a.business.type.charAt(0) + a.business.type.slice(1).toLowerCase()
      : '',
    businessLogoUrl:  a.business?.logo_url    || null,
    businessPhone:    a.business?.phone        || null,
    businessAddress:  a.business?.address      || null,
    serviceName:      a.service?.name          || '',
    serviceId:        a.service?.id            || null,
    date:             a.start_datetime,
    time,
    status:           a.status.toLowerCase(),
    price:            a.service?.price != null ? Number(a.service.price) : null,
    duration:         a.service?.duration_minutes || null,
    rating:           a.rating    ?? null,
    reviewText:       a.review_text ?? a.reviewText ?? null,
  }
}

export async function submitReview({ appointmentId, businessId, clientId, score, comment }) {
  const { data } = await api.post('/reviews', { appointmentId, businessId, clientId, score, comment })
  return data
}

export async function getAppointments({ status, clientId } = {}) {
  const params = {}
  if (status) params.status = status
  if (clientId) params.clientId = clientId
  const { data } = await api.get('/appointments', { params })
  return (data.appointments || []).map(transformAppointment)
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.put(`/appointments/${id}/status`, { status })
  return data
}

export async function cancelAppointment(id) {
  return updateAppointmentStatus(id, 'CANCELLED')
}

export async function createManualAppointment({ businessId, serviceId, startDatetime, clientName, clientPhone }) {
  const body = { businessId, serviceId, startDatetime, clientName }
  if (clientPhone) body.clientPhone = clientPhone
  const { data } = await api.post('/appointments/manual', body)
  return data
}

export async function getAppointmentById(id) {
  const { data } = await api.get(`/appointments/${id}`)
  const a = data.appointment || data
  return a ? transformAppointment(a) : null
}
