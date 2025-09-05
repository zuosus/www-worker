import { Context } from 'hono'

export function PlatformAsync(c: Context, promise: Promise<unknown>): void {
  c.executionCtx.waitUntil(promise)
}
