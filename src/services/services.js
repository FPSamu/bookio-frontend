import api from './api'

export async function getOwnServices() {
  const { data } = await api.get('/services')
  return data.services || []
}

export async function createService({ name, durationMinutes, price }) {
  const { data } = await api.post('/services', { name, durationMinutes, price })
  return data.service
}

export async function getServiceSchedule(serviceId) {
  const { data } = await api.get(`/services/${serviceId}/schedule`)
  return data.schedules ?? []
}

export async function upsertServiceScheduleDay(serviceId, { dayOfWeek, startTime, endTime }) {
  const { data } = await api.put(`/services/${serviceId}/schedule`, { dayOfWeek, startTime, endTime })
  return data.schedule
}

export async function removeServiceScheduleDay(serviceId, dayId) {
  await api.delete(`/services/${serviceId}/schedule/${dayId}`)
}
