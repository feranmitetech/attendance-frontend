import { create } from 'zustand'
import api from '../lib/api'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  school: JSON.parse(localStorage.getItem('school') || 'null'),
  token: localStorage.getItem('token'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('school', JSON.stringify(data.school))
    set({ user: data.user, school: data.school, token: data.token })
    return data
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('school', JSON.stringify(data.school))
    set({ user: data.user, school: data.school, token: data.token })
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    set({ user: null, school: null, token: null })
  },
}))
