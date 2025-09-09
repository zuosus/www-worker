import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as schema from '../db/schema'
import { getDB } from '../db'
import { CTX, Bindings } from '../../types/types'

const payments = new Hono<{ Bindings: Bindings }>()

/**
 * Secure endpoint to create a new transaction with pending status.
 * The actual credit is added only after webhook confirmation from the provider.
 */
payments.post('/create-transaction', async (c: CTX) => {
  console.log('Create transaction endpoint called')
  try {
    const body = await c.req.json<{
      project: string
      userId: number
      amount: number
      vendor: string
    }>()
    const db = getDB(c.env.D1)

    // Insert a pending transaction record
    console.log('Inserting payment record with values:', body)
    const result = await db.insert(schema.payments).values(body)

    return c.json({
      success: true,
      body: {
        id: result.meta.last_row_id,
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.log('Create transaction error:', error)
    throw new HTTPException(500, { message: 'Failed to create transaction' })
  }
})

/*
// Get payment statistics
payments.get('/stats', async (c: CTX) => {
  try {
    const uid = c.get('uid')
    const db = getDB(c.env.D1)

    // Get total payments and credits
    const paymentStats = await db
      .select({
        totalPaid: schema.payments.amount,
        totalCredits: schema.payments.creditAmount,
      })
      .from(schema.payments)
      .where(eq(schema.payments.userId, uid))

    // Calculate totals
    const totalPaid = paymentStats.reduce((sum, p) => sum + p.totalPaid, 0)
    const totalCreditsReceived = paymentStats.reduce((sum, p) => sum + p.totalCredits, 0)

    // Get total spent from sessions
    const sessionStats = await db
      .select({
        totalSpent: schema.sessions.costAmount,
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, uid))

    const totalSpent = sessionStats.reduce((sum, s) => sum + (s.totalSpent || 0), 0)

    // Get current balance
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, uid),
      columns: { creditBalance: true },
    })

    return c.json({
      success: true,
      data: {
        totalPaid, // Total amount paid in cents
        totalCreditsReceived, // Total credits received in cents
        totalSpent, // Total credits spent in cents
        currentBalance: user?.creditBalance || 0, // Current balance in cents
      },
    })
  } catch (error) {
    console.log('Get payment stats error:', error)
    throw new HTTPException(500, { message: 'Failed to retrieve payment statistics' })
  }
})
*/

export default payments
