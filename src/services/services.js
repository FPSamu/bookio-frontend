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

export async function updateService(serviceId, { name, durationMinutes, price }) {
  const { data } = await api.put(`/services/${serviceId}`, { name, durationMinutes, price })
  return data.service
}

export async function deleteService(serviceId) {
  await api.delete(`/services/${serviceId}`)
}

export async function uploadServicePhoto(serviceId, file) {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await api.patch(`/services/${serviceId}/photo`, formData)
  return data.photo_url
}

export async function setServicePhotoUrls(serviceId, photos) {
  const { data } = await api.put(`/services/${serviceId}/photo-urls`, { photos })
  return data.photos
}

export async function uploadServicePhotos(serviceId, files) {
  const formData = new FormData()
  files.forEach((f) => formData.append('photos', f))
  const { data } = await api.patch(`/services/${serviceId}/photos`, formData)
  return data.photos
}
