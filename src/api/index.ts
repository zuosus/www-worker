import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { Bindings } from '../types/types'
// import { CTX } from '../types/types'
import { TrieRouter } from 'hono/router/trie-router'
// import { logError } from './logError'
import { HTTPException } from 'hono/http-exception'
import { Variables } from 'hono/types'
import { jwtVerify, SignJWT } from 'jose'
import { scheduled as scheduledHandler } from '../cron/schedule'
import webhook from './routes/webhook'
import payments from './routes/payments'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>({ router: new TrieRouter() })

app.get('/ping', (c) => c.text('pong'))

app.use(logger())

app.use(
  '*',
  cors({
    origin: ['https://*.zuos.us', 'https://zuos.us', 'http://localhost:3000', 'http://localhost:8787'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'User-Agent'],
    maxAge: 600,
    credentials: true,
  })
)

app.route('/webhook', webhook)
app.route('/payments', payments)

// JWT utilities
const createJWT = async (payload: { uid: number }, secret: string, expiresIn = '24h') => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret))
}

const createRefreshToken = async (payload: { uid: number }, secret: string) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    // No expiration for refresh tokens - they are permanent until invalidated
    .sign(new TextEncoder().encode(secret))
}

const verifyJWT = async (token: string, secret: string) => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload
  } catch {
    return null
  }
}

// error handling
app.onError((err, c) => {
  // logError(err, c as CTX)

  if (err instanceof HTTPException) {
    if (err.status === 401) {
      return c.text(err.message, 401)
    } else {
      return c.json(
        {
          success: false,
          message: err.message || 'internal service err',
        },
        err.status
      )
    }
  } else {
    return c.json(
      {
        success: false,
        message: 'internal service error',
      },
      500
    )
  }
})

export { createJWT, createRefreshToken, verifyJWT }

const worker = {
  fetch: app.fetch,
  scheduled: scheduledHandler,
}

export default worker
