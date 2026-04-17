import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

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
  const [sessionChecked, setSessionChecked] = useState(false)

  // On mount: verify the httpOnly cookies are still valid.
  // localStorage can outlive cookies, so we confirm with the server
  // before trusting the stored user.
  useEffect(() => {
    const stored = readStoredUser()
    if (!stored) {
      setSessionChecked(true)
      return
    }
    axios.get('/api/admin/profile/', { withCredentials: true })
      .then(() => {
        setSessionChecked(true)
      })
      .catch(err => {
        if (err.response?.status === 401) {
          // Cookies have expired — clear stale localStorage state
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
        setSessionChecked(true)
      })
  }, [])

  const login = useCallback(async (username, password, rememberMe = false) => {
    const res = await axios.post('/api/auth/login/', {
      username,
      password,
      remember_me: rememberMe,
    }, { withCredentials: true })

    const userInfo = {
      username:     res.data.username,
      isStaff:      res.data.is_staff,
      isSuperAdmin: res.data.is_superuser,
      role:         res.data.role,
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

  // Don't render children until we've confirmed whether the session is live.
  // This prevents a flash of the admin panel before the 401 redirect fires.
  if (!sessionChecked) return null

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function canAccess(user, ...roles) {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return roles.includes(user.role)
}
