'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface UseProtectedRouteOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useProtectedRoute({
  redirectTo = '/',
  requireAuth = true,
}: UseProtectedRouteOptions = {}) {
  const { user, isLoggedIn, isLoading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isLoggedIn) {
      console.log('Authentication required but user not logged in, redirecting to:', redirectTo)
      setShouldRedirect(true)
      // Small delay to show loading state
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, 500)
      return () => clearTimeout(timer)
    }

    if (!requireAuth && isLoggedIn) {
      // For pages that should only be accessible when NOT logged in (like login/signup)
      console.log('User already logged in, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isLoggedIn, isLoading, router, redirectTo, requireAuth])

  return {
    user,
    isLoggedIn,
    isLoading,
    shouldRedirect,
    isAuthorized: requireAuth ? isLoggedIn : !isLoggedIn,
  }
}
