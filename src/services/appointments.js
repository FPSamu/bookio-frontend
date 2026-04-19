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
    businessName: a.business?.name || '',
    businessType: TYPE_MAP[a.business?.type] || 'other',
    businessCategory: a.business?.type
      ? a.business.type.charAt(0) + a.business.type.slice(1).toLowerCase()
      : '',
    serviceName: a.service?.name || '',
    date: a.start_datetime,
    time,
    status: a.status.toLowerCase(),
    price: a.service?.price != null ? Number(a.service.price) : null,
    duration: a.service?.duration_minutes || null,
  }
}

export async function getAppointments({ status, clientId } = {}) {
  const params = {}
  if (status) params.status = status
  if (clientId) params.clientId = clientId
  const { data } = await api.get('/appointments', { params })
  return (data.appointments || []).map(transformAppointment)
}

export async function cancelAppointment(id) {
  const { data } = await api.delete(`/appointments/${id}`)
  return data
}
