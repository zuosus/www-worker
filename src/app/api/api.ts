import Cookies from 'js-cookie'
// import { authManager } from './auth'

const getAuthToken = () => {
  // First try to get token from localStorage (new approach)
  const token = localStorage.getItem('access_token')
  if (token) {
    return token
  }
  // Fallback to cookies (old approach)
  return Cookies.get('auth_token')
}

const getDefaultHeaders = () => {
  const token = getAuthToken()
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

const handle = async <T>(res: Promise<Response>): Promise<T> => {
  const result = await res
  if (result.ok) {
    return result.json()
  }
  throw new Error(result.status.toString())
}

const api = {
  getAuthToken,

  // Generic helpers
  get: async <T>(url: string) => handle<T>(fetch(url, { headers: getDefaultHeaders() })),

  post: async <T>(url: string, body: Record<string, unknown>) =>
    handle<T>(
      fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      })
    ),

  put: async <T>(url: string, body: Record<string, unknown>) =>
    handle<T>(
      fetch(url, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      })
    ),

  del: async <T>(url: string) =>
    handle<T>(fetch(url, { method: 'DELETE', headers: getDefaultHeaders() })),

  // Business-specific API methods
  createTransaction: async (project: string, userId: number, amount: number, vendor: string) => {
    const result = await api.post<{
      success: boolean
      body: { id: string }
    }>('/api/payments/create-transaction', { project, userId, amount, vendor })
    return result
  },
}

// --- Internal API Extensions ---
export async function verifyTurnstileCaptcha(
  secret: string,
  token: string,
  remoteip: string
): Promise<{ success: boolean; challenge_ts?: string; hostname?: string }> {
  return externalRequest<{ success: boolean; challenge_ts?: string; hostname?: string }>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip }),
    }
  )
}

async function externalRequest<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}

export default api
