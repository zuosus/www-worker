import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { eq } from 'drizzle-orm'
import * as schema from '@/api/db/schema'
import { getDB } from '@/api/db'
import { CTX, Bindings } from '@/types/types'
import { Paddle, EventName } from '@paddle/paddle-node-sdk'

const paddleWebhook = new Hono<{ Bindings: Bindings }>()

// Handle Paddle webhook callbacks
paddleWebhook.post('/paddle', async (c: CTX) => {
  console.log('SANDBOX')
  try {
    // Get the raw body and signature from headers
    const rawBody = await c.req.text()
    console.log('Paddle webhook endpoint called', rawBody)
    const signature = c.req.header('paddle-signature')
    const apiKey = 'pdl_sdbx_apikey_01k4r1t0j8n92g4dqc3h8qp7tz_awsc52zRypJMgBWFMRKnHb_AT0'

    if (!signature || !apiKey) {
      console.log('Missing Paddle signature header or Api Key')
      throw new HTTPException(400, { message: 'Missing required Params' })
    }

    // Verify webhook signature
    const secretKey = 'pdl_ntfset_01k4r1rw5rjzgf461b9n4y99tx_STco8NJlqOhU7Ol202B0krr9hpUYj7CS'

    const paddle = new Paddle(apiKey)

    // The `unmarshal` function will validate the integrity of the webhook and return an entity
    const payload = await paddle.webhooks.unmarshal(rawBody, secretKey, signature)
    const data = payload.data as unknown as Record<string, unknown>
    console.log('Paddle webhook payload data:', JSON.stringify(data))
    const customData = (data.customData ?? data.custom_data) as { id: string }
    if (!customData || !customData.id) {
      console.log('Missing custom data in Paddle webhook payload')
      throw new HTTPException(400, { message: 'Missing custom data in payload' })
    }
    const txId = customData.id
    await persistPaddleEvent(txId)

    const db = getDB(c.env.D1)

    // Handle different event types
    switch (payload.eventType) {
      case EventName.TransactionPaid: {
        // Find the payment record by transaction ID
        const existingPayment = await db.query.payments.findFirst({
          where: eq(schema.payments.vendorId, txId),
        })

        // Update the payment record
        if (existingPayment) {
          await db
            .update(schema.payments)
            .set({
              status: data.status as string,
              vendorId: data.id as string,
              updatedAt: Math.floor(Date.now() / 1000),
            })
            .where(eq(schema.payments.id, Number(txId)))

          // If transaction is completed, update user's credit balance
          if (data.status === 'completed' && existingPayment.status !== 'completed') {
            console.log(`${existingPayment.userId}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled Paddle webhook event: ${payload.eventType}`)
        break
    }

    return c.json({ success: true })
  } catch (error) {
    console.log('Paddle webhook error:', error)
    if (error instanceof HTTPException) {
      throw error
    }
    throw new HTTPException(500, { message: 'Webhook processing failed' })
  }
})

// persist paddle webhook data to R2 storage
const persistPaddleEvent = async (transactionId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Persisting Paddle event for transaction ID: ${transactionId}`)
      resolve()
    }, 0)
  })
}

export default paddleWebhook
