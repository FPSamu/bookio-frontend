import api from './api'

const serviceService = {
  getOwnServices: async () => {
    const { data } = await api.get('/services')
    return data
  },
  create: async (serviceData) => {
    const { data } = await api.post('/services', serviceData)
    return data
  },
  uploadPhoto: async (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    
    const { data } = await api.patch(`/services/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  }
}

export default serviceService
