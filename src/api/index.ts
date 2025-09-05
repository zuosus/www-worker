import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { Bindings } from '../types/types'
import { CTX } from '../types/ctx'
import { PlatformKV } from './kv'
import { PlatformAsync } from './platform'
import { TrieRouter } from 'hono/router/trie-router'
import { logError } from './logError'
import { HTTPException } from 'hono/http-exception'
import { Variables } from 'hono/types'
import { drizzleMiddleware } from './db/middleware'
import { eq } from 'drizzle-orm'
import * as schema from './db/schema'
import { jwtVerify, SignJWT } from 'jose'
import { getDB } from './db'
import { scheduled as scheduledHandler } from '../cron/schedule'
import auth from './routes/auth'
import dashboard from './routes/dashboard'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>({ router: new TrieRouter() })

app.get('/ping', (c) => c.text('pong'))

app.use(logger())
app.use(drizzleMiddleware)

app.use(
  '*',
  cors({
    origin: ['https://meeting-notes.example.com', 'http://localhost:3000'], // Update with your domain
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'User-Agent'],
    maxAge: 600,
    credentials: true,
  })
)

// identity validation
const validateInDB = async (uid: number, c: CTX) => {
  try {
    const db = getDB(c.env.D1)
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, uid),
      columns: { email: true, closed: true },
    })

    if (!user) return null

    // Check if account is closed
    if (user.closed) {
      throw new HTTPException(403, { message: 'Account has been closed' })
    }

    return user.email
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    throw new Error('db err ' + String(err), { cause: uid })
  }
}

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

const authMiddleware = async (c: CTX, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  const jwtSecret = await c.env.JWT_SECRET.get()
  const decodedPayload = await verifyJWT(token, jwtSecret || '')
  if (!decodedPayload || typeof decodedPayload.uid !== 'number') {
    return c.json({ success: false, message: 'Invalid token' }, 401)
  }

  const uid = decodedPayload.uid
  const kv = new PlatformKV(c)
  try {
    let email = await kv.get('uid_' + uid)
    if (!email) {
      email = await validateInDB(uid, c)
      if (email && typeof email === 'string' && email.length > 0) {
        PlatformAsync(
          c,
          kv.put('uid_' + String(uid), email, {
            expirationTtl: 3600,
          })
        )
      } else {
        console.log('err: no email found for uid ' + uid)
        return c.json({ success: false, message: 'User not found' }, 401)
      }
    }
    c.set('uid', uid)
    await next()
  } catch {
    return c.json({ success: false, message: 'Authentication failed' }, 401)
  }
}

// Apply auth middleware to protected routes
app.use('/dashboard/*', authMiddleware)
app.use('/user/*', authMiddleware)

// Public routes (register, login, refresh, logout)
app.route('/', auth)

// Protected routes
app.route('/dashboard', dashboard)

// error handling
app.onError((err, c) => {
  logError(err, c as CTX)

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
