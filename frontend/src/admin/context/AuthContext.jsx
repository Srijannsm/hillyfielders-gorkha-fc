import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY   = 'gfc_admin_access'
const REFRESH_KEY = 'gfc_admin_refresh'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return { username: payload.username ?? payload.user_id, isStaff: payload.is_staff }
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const res = await axios.post('/api/auth/login/', { username, password })
    const { access, refresh } = res.data
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    const payload = JSON.parse(atob(access.split('.')[1]))
    setUser({ username: payload.username ?? username, isStaff: payload.is_staff })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }, [])

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
