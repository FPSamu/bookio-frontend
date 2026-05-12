import axios from 'axios'
import { auth } from '../lib/firebase'

const api = axios.create({ timeout: 8000 })

api.interceptors.request.use(async (config) => {
  config.baseURL = window.__BOOKIO_API_URL__ ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
