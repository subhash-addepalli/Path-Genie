import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app load
  useEffect(() => {
    const token    = localStorage.getItem('cg_token')
    const userData = localStorage.getItem('cg_user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      // Verify token is still valid with backend
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => {
          localStorage.removeItem('cg_token')
          localStorage.removeItem('cg_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('cg_token', data.token)
    localStorage.setItem('cg_user', JSON.stringify({ name: data.name, email: data.email }))
    setUser({ name: data.name, email: data.email })
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('cg_token', data.token)
    localStorage.setItem('cg_user', JSON.stringify({ name: data.name, email: data.email }))
    setUser({ name: data.name, email: data.email })
    return data
  }

  const logout = () => {
    localStorage.removeItem('cg_token')
    localStorage.removeItem('cg_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
