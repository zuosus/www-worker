'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <span className="sr-only">Toggle theme</span>
        <div className="w-4 h-4" />
      </Button>
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 h-9 p-0 relative"
      onClick={() => {
        if (theme === 'system') {
          setTheme('light')
        } else if (theme === 'light') {
          setTheme('dark')
        } else {
          setTheme('system')
        }
      }}
      title={`Current: ${theme} ${theme === 'system' ? `(${systemTheme})` : ''}`}
    >
      <span className="sr-only">Toggle theme</span>
      {currentTheme === 'light' ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      {theme === 'system' && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </Button>
  )
}
