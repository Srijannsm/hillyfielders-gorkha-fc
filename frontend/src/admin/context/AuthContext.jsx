import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Non-sensitive display info only — tokens live in httpOnly cookies, never JS
const USER_KEY = 'gfc_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async (username, password) => {
    // Credentials are validated server-side; response sets httpOnly cookies
    const res = await axios.post('/api/auth/login/', { username, password }, {
      withCredentials: true,
    })
    const userInfo = {
      username: res.data.username,
      isStaff:  res.data.is_staff,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setUser(userInfo)
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout/', {}, { withCredentials: true })
    } catch {
      // Server-side cookie clearing failed — still clear locally
    }
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
