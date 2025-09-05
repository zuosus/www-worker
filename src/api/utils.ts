// Common utility functions for the API
// Constants

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '24h',
  REFRESH_TOKEN: '30d',
} as const

// Helper function to generate UUID
export function generateUUID(): string {
  return crypto.randomUUID()
}

// Helper function to hash passwords using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password)
  return hashedPassword === hash
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' }
  }

  return { valid: true }
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Helper function to sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

// Response helper functions
export function successResponse(
  data: Record<string, unknown>,
  message?: string
): Record<string, unknown> {
  return {
    success: true,
    ...(message && { message }),
    ...data,
  }
}

export function errorResponse(message: string, code?: string) {
  return {
    success: false,
    message,
    ...(code && { code }),
  }
}
