import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If token expires, redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('school')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function getSchoolPlan() {
  const token = localStorage.getItem('token')
  if (!token) return 'trial'
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.plan || 'trial'
  } catch {
    return 'trial'
  }
}

export default api
