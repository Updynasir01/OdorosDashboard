import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

const TOKEN_KEY = 'odoros_admin_token'
const USER_KEY = 'odoros_admin_username'

interface AdminContextType {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  login: (token: string, username: string) => void
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USER_KEY))

  const login = useCallback((newToken: string, newUsername: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUsername(null)
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) setToken(e.newValue)
      if (e.key === USER_KEY) setUsername(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <AdminContext.Provider
      value={{
        token,
        username,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
