'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Footer } from '@/components/custom/footer'

type PersistentLayoutProps = {
  children: ReactNode
  className?: string
}

export function PersistentLayout({ children, className }: PersistentLayoutProps) {
  const pathname = usePathname()

  // Use full-width layout for homepage and auth pages
  const isAuthPage =
    pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password'
  if (pathname === '/' || isAuthPage) {
    return <>{children}</>
  }
  return (
    <div className="min-h-screen p-4 md:p-6 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-[1200px] mx-auto">
        {/* Mobile layout: stacked sections */}
        <div className="flex flex-col space-y-4 lg:hidden">
          {/* Main content - middle on mobile */}
          <div className={`flex-1 pr-12 ${className || ''}`}>{children}</div>

          {/* Footer section - bottom on mobile */}
          <div className="rounded-lg border bg-card p-4">
            <Footer />
          </div>
        </div>

        {/* Desktop layout: navigation left, content right */}
        <div className="hidden lg:flex lg:flex-row gap-6">
          {/* Left sidebar with navigation and footer - this stays fixed */}
          <div className="flex-shrink-0" style={{ width: '420px' }}>
            <div className="flex flex-col gap-4 sticky top-6">
              <div className="rounded-lg border bg-card p-6">
                <Footer />
              </div>
            </div>
          </div>

          {/* Right side with main content - this changes */}
          <div className={`flex-1 pr-12 ${className || ''}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}
