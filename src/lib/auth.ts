import { useEffect, useState } from 'react'

export interface User {
  id: number
  email: string
  creditBalance?: number
  closed?: boolean
}

export interface DecodedToken {
  uid: number
  exp: number
  iat: number
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for display purposes only, not for security validation
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload)) as DecodedToken
    return decoded
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Get user information from stored tokens
 */
export function getUserFromToken(): { userId: number; email?: string } | null {
  if (typeof window === 'undefined') return null

  const accessToken = localStorage.getItem('access_token')
  if (!accessToken) return null

  if (isTokenExpired(accessToken)) {
    // Token is expired, clear it
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }

  const decoded = decodeJWT(accessToken)
  if (!decoded) return null

  // Try to get email from localStorage if stored during login/signup
  const userEmail = localStorage.getItem('user_email')

  return {
    userId: decoded.uid,
    email: userEmail || undefined,
  }
}

/**
 * Store user email in localStorage (called during login/signup)
 */
export function storeUserEmail(email: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_email', email)
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_email')
  }
}

/**
 * Hook to get current authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<{ userId: number; email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userInfo = getUserFromToken()
    setUser(userInfo)
    setIsLoading(false)
  }, [])

  const logout = () => {
    clearAuthData()
    setUser(null)
  }

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    logout,
  }
}
