import { MiddlewareHandler } from 'hono'
import { getDB } from './index'
import { Bindings } from '../../types/types'
import { Variables } from '../../types/ctx'

export const drizzleMiddleware: MiddlewareHandler<{
  Bindings: Bindings
  Variables: Variables
}> = async (c, next) => {
  c.set('db', getDB(c.env.D1))
  await next()
}
