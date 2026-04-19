import api from './api'

export async function getBusinessForBooking(businessId) {
  const { data } = await api.get(`/businesses/${businessId}`)
  return data.business
}

export async function getAvailableSlots({ businessId, serviceId, dateStr, serviceDuration }) {
  const { data } = await api.get('/appointments/slots', {
    params: { businessId, serviceId, dateStr, serviceDuration },
  })
  return data.availableSlots ?? []
}

export async function bookAppointment({ businessId, serviceId, dateStr, time }) {
  const { data } = await api.post('/appointments', {
    businessId,
    serviceId,
    startDatetime: `${dateStr}T${time}:00`,
  })
  return data
}
