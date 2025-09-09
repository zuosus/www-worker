import { HTTPException } from 'hono/http-exception'
import { CTX } from '../types/types'

export function logError(err: Error | HTTPException, c: CTX) {
  const path = c.req.path
  const method = c.req.method
  // const params = c.req.param
  const internalCause = err.cause

  if (err instanceof HTTPException) {
    const status = err.status
    const message = err.message

    console.log(
      `[HTTP_ERROR] ${status} ${method} ${path}: ` +
        `Message to user: "${message}". ` +
        `Internal cause: ${internalCause ? JSON.stringify(internalCause) : 'N/A'}` +
        (err.stack ? `\nStack: ${err.stack}` : '') // 记录内部错误的堆栈
    )
  } else {
    console.log(
      `[UNKNOWN_ERROR] ${method} ${path}: ` +
        `Error: ${err.message}` +
        `Internal cause: ${internalCause ? JSON.stringify(internalCause) : 'N/A'}` +
        `\nStack: ${err.stack}`
    )
  }
}
