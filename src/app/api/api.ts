import Cookies from 'js-cookie'

// API configuration and utilities for future use
// const HOST = '/api'

const getAuthToken = () => Cookies.get('auth_token')

// const getDefaultHeaders = () => {
//   const token = getAuthToken()
//   return {
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   }
// }

// const handle = async <T>(res: Promise<Response>): Promise<T> => {
//   const result = await res
//   if (result.ok) {
//     return result.json()
//   }
//   throw new Error(result.status.toString())
// }

const api = { getAuthToken }

export default api
