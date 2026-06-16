import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401 — but NOT on login/register/otp routes
// Those routes return 401 for wrong credentials and must show error to user
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/resend-otp']

api.interceptors.response.use(
  res => res,
  err => {
    const isAuthRoute = AUTH_ROUTES.some(route => err.config?.url?.includes(route))

    if (err.response?.status === 401 && !isAuthRoute) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('cg_token')
      localStorage.removeItem('cg_user')
      window.location.href = '/login'
    }

    // For auth routes — just reject so the page can show the error message
    return Promise.reject(err)
  }
)

export default api
