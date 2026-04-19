import api from './api'

const appointmentService = {
  getAll: async (status) => {
    const params = status ? { status } : {}
    const { data } = await api.get('/appointments', { params })
    return data
  },
  getSlots: async (businessId, date) => {
    // date in format YYYY-MM-DD
    const { data } = await api.get('/appointments/slots', {
      params: { businessId, date }
    })
    return data
  },
  create: async (appointmentData) => {
    const { data } = await api.post('/appointments', appointmentData)
    return data
  },
  updateStatus: async (id, status) => {
    const { data } = await api.put(`/appointments/${id}/status`, { status })
    return data
  }
}

export default appointmentService
