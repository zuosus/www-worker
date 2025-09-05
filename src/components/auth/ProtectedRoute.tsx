'use client'

import { useProtectedRoute } from '@/hooks/useProtectedRoute'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/',
  loadingComponent,
}: ProtectedRouteProps) {
  const { isLoading, shouldRedirect, isAuthorized } = useProtectedRoute({
    redirectTo,
    requireAuth: true,
  })

  // Show custom loading component or default
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
          </div>
        </div>
      )
    )
  }

  // Show redirect message while redirecting
  if (shouldRedirect || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse rounded-full h-12 w-12 bg-blue-200 dark:bg-blue-800"></div>
          <p className="text-gray-600 dark:text-gray-300">Please log in to access this page...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to home page</p>
        </div>
      </div>
    )
  }

  // If authenticated, render the protected content
  return <>{children}</>
}
