import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, parseJwt, TOKEN_STORAGE_KEY, userApi } from '../lib/api'
import type { UserDto } from '../types/api'

interface AuthContextValue {
  token: string | null
  user: UserDto | null
  userId: number | null
  roles: string[]
  isAdmin: boolean
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<UserDto | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)))

  const decoded = token ? parseJwt(token) : null
  const isExpired = decoded ? decoded.exp * 1000 < Date.now() : true
  const activeToken = token && !isExpired ? token : null
  const userId = activeToken && decoded ? decoded.id : null
  const roles = activeToken && decoded ? decoded.roles ?? [] : []
  const isAdmin = roles.includes('ROLE_ADMIN')
  const isAuthenticated = Boolean(activeToken && userId)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async (): Promise<UserDto | null> => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!stored) {
      setUser(null)
      return null
    }
    const parsed = parseJwt(stored)
    if (!parsed || parsed.exp * 1000 < Date.now()) {
      logout()
      return null
    }
    try {
      const fetched = await userApi.getById(parsed.id)
      setUser(fetched)
      return fetched
    } catch {
      return null
    }
  }, [logout])

  useEffect(() => {
    let active = true
    async function init() {
      if (!activeToken || !userId) {
        if (token && isExpired) logout()
        setLoading(false)
        return
      }
      setLoading(true)
      const fetched = await refreshUser()
      if (active) {
        if (!fetched) logout()
        setLoading(false)
      }
    }
    void init()
    return () => {
      active = false
    }
  }, [activeToken, userId, token, isExpired, logout, refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password)
      const jwt = res.data.token
      localStorage.setItem(TOKEN_STORAGE_KEY, jwt)
      setToken(jwt)
      await refreshUser()
    },
    [refreshUser]
  )

  const signup = useCallback(
    async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
      await authApi.signup(payload)
    },
    []
  )

  return (
    <AuthContext.Provider
      value={{
        token: activeToken,
        user,
        userId,
        roles,
        isAdmin,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
