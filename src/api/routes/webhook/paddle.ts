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
  try {
    // Get the raw body and signature from headers
    const rawBody = await c.req.text()
    const signature = c.req.header('paddle-signature')
    const apiKey = await c.env.PADDLE_API_KEY.get()

    if (!signature || !apiKey) {
      console.log('Missing Paddle signature header or Api Key')
      throw new HTTPException(400, { message: 'Missing required Params' })
    }

    // Verify webhook signature
    const secretKey = await c.env.PADDLE_WEBHOOK_SECRET.get()
    if (!secretKey) {
      console.log('PADDLE_WEBHOOK_SECRET not configured')
      throw new HTTPException(500, { message: 'Webhook secretKey not configured' })
    }

    const paddle = new Paddle(apiKey)

    // The `unmarshal` function will validate the integrity of the webhook and return an entity
    const payload = await paddle.webhooks.unmarshal(rawBody, secretKey, signature)
    const data = payload.data as unknown as Record<string, unknown>
    const customData = data.custom_data as { id: string }
    const txId = customData.id
    await persistPaddleEvent(c, txId, rawBody)

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
const persistPaddleEvent = async (
  c: CTX,
  transactionId: string,
  rawBody: string
): Promise<void> => {
  const r2 = c.env.R2
  const timestamp = new Date().toISOString()
  const objectKey = `paddle-webhook/${transactionId}/${timestamp}.json`

  await r2.put(objectKey, rawBody, {
    httpMetadata: {
      contentType: 'application/json',
    },
  })

  console.log(`Successfully persisted Paddle webhook event to R2: ${objectKey}`)
}

export default paddleWebhook
