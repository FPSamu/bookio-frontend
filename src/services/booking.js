import api from './api'

export async function getBusinessForBooking(businessId) {
  const { data } = await api.get(`/businesses/${businessId}`)
  return data.business
}

function todayStr() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export async function getAvailableSlots({ businessId, serviceId, dateStr, serviceDuration }) {
  const { data } = await api.get('/appointments/slots', {
    params: { businessId, serviceId, dateStr, serviceDuration },
  })
  const slots = data.availableSlots ?? []
  if (dateStr !== todayStr()) return slots
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return slots.filter(slot => {
    const [h, m] = slot.split(':').map(Number)
    return h * 60 + m > nowMin
  })
}

export async function bookAppointment({ businessId, serviceId, dateStr, time }) {
  // Send with CDMX offset (-06:00) so backend stores correct UTC
  const { data } = await api.post('/appointments', {
    businessId,
    serviceId,
    startDatetime: `${dateStr}T${time}:00-06:00`,
  })
  return data
}
