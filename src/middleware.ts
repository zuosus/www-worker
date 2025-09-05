import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  // Simple authentication check - verifies if auth token exists
  const isAuthenticated = !!token

  const protectedPaths = ['/admin']

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to home page if trying to access protected path without authentication
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname) // Optional: add redirect parameter to return to original page after login
    return NextResponse.redirect(loginUrl)
  }

  // 如果是认证用户或非受保护路径，继续请求
  return NextResponse.next()
}

// 可选：配置只对特定路径运行 middleware，提高效率
export const config = {
  matcher: ['/admin/:path*'], // 匹配所有以 /admin 开头的路径
}
