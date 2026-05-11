import api from './api'
import { auth } from '../lib/firebase'

export async function updateProfile({ name, phone }) {
  const { data } = await api.put('/users/profile', { name, phone })
  return data.user ?? data
}

export async function uploadAvatar(file) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('No authenticated user')
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await api.patch(`/users/${uid}/avatar`, formData)
  return data.avatar_url || data.avatarUrl
}
