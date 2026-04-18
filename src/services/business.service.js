import api from './api'

const businessService = {
  getAll: async (params = { page: 1, limit: 10 }) => {
    const { data } = await api.get('/businesses', { params })
    return data
  },
  getRecommended: async () => {
    const { data } = await api.get('/businesses/recommended')
    return data
  },
  getById: async (id) => {
    const { data } = await api.get(`/businesses/${id}`)
    return data
  },
  getServices: async (id) => {
    const { data } = await api.get(`/businesses/${id}/services`)
    return data
  },
  getMetrics: async () => {
    const { data } = await api.get('/businesses/metrics')
    return data
  },
  getReservations: async (date) => {
    // date in format YYYY-MM-DD
    const { data } = await api.get('/businesses/reservations', {
      params: { date }
    })
    return data
  }
}

export default businessService
