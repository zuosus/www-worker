import { Bindings } from '../types/types'

// Export the scheduled function for Cloudflare Workers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const scheduled = async (_event: ScheduledEvent, _env: Bindings) => {
  console.log(`Scheduled cleanup triggered at ${new Date().toISOString()}`)

  try {
    // Run session cleanup every minute
    // await someAsyncOperation()
    return Promise.resolve()
  } catch (error) {
    console.error('Scheduled cleanup failed:', error)
    return Promise.reject(new Error(String(error)))
  }
}
