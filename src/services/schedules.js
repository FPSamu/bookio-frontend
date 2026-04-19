import api from './api'

export async function getMySchedules() {
  const { data } = await api.get('/schedules')
  return { schedules: data.schedules ?? [], blockedSlots: data.blockedSlots ?? [] }
}

export async function upsertDay({ dayOfWeek, startTime, endTime }) {
  const { data } = await api.put('/schedules', { dayOfWeek, startTime, endTime })
  return data.schedule
}

export async function removeDay(id) {
  await api.delete(`/schedules/${id}`)
}

export async function addBlockedSlot({ date, startTime, endTime, reason }) {
  const { data } = await api.post('/schedules/blocked', { date, startTime, endTime, reason })
  return data.blockedSlot
}

export async function removeBlockedSlot(id) {
  await api.delete(`/schedules/blocked/${id}`)
}
