import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { CTX, Bindings } from '@/types/types'
import { Paddle, EventName, EventEntity } from '@paddle/paddle-node-sdk'
import * as schema from '@/api/db/schema'
import * as notesSchema from '@/api/db/notes_schema'
import { sendPushNotification } from '@/rpc/services/push-notification'
import { toast } from 'sonner'
import { eq, sql } from 'drizzle-orm'
import { getDB, getNotesDB } from '@/api/db'

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

    switch (payload.eventType) {
      case EventName.TransactionCompleted: {
        const txId = extractTransactionId(payload.data as unknown as Record<string, unknown>)
        if (!txId) {
          console.log(
            'Missing transaction ID in Paddle webhook payload',
            JSON.stringify(payload.data)
          )
          throw new HTTPException(400, { message: 'Missing transaction ID in payload' })
        }
        await persistPaddleEvent(c, payload.eventType, txId, rawBody)
        await transactionCompleted(c, txId, payload)
        break
      }
      case EventName.AdjustmentCreated:
      case EventName.AdjustmentUpdated: {
        const paymentId = payload.data.id
        await persistPaddleEvent(c, payload.eventType, paymentId, rawBody)
        await adjustmentUpdated()
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
  eventType: string,
  id: string,
  rawBody: string
): Promise<void> => {
  const r2 = c.env.R2
  const timestamp = new Date().toISOString()
  const objectKey = `paddle-webhook/${eventType}/${id}/${timestamp}.json`

  await r2.put(objectKey, rawBody, {
    httpMetadata: {
      contentType: 'application/json',
    },
  })

  console.log(`Successfully persisted Paddle webhook event to R2: ${objectKey}`)
}

const extractTransactionId = (data: Record<string, unknown>): string | null => {
  const customData = (data.customData ?? data.custom_data) as { id: string } | undefined
  if (customData && customData.id) {
    return customData.id
  }
  return null
}

const transactionCompleted = async (c: CTX, txId: string, payload: EventEntity) => {
  c.executionCtx.waitUntil(sendPushNotification(`SANDBOX: Paddle Get Paid`))

  const data = payload.data as unknown as Record<string, unknown>
  const db = getDB(c.env.D1)

  // Find the payment record by transaction ID
  const existingPayment = await db.query.payments.findFirst({
    where: eq(schema.payments.id, parseInt(txId)),
  })

  const items = data.items as [{ quantity: number }]
  const count = items.length > 0 ? items[0].quantity : 0
  if (count <= 0) {
    console.log(
      `Transaction item quantity is zero or negative for transaction ID: ${txId}, quantity: ${count}`
    )
    throw new HTTPException(500, { message: 'Transaction item quantity is zero or negative' })
  }

  // Update the payment record
  if (existingPayment) {
    const status = data.status as string
    const toUpdate = {
      status: status,
      vendorId: data.id as string,
      updatedAt: Math.floor(Date.now() / 1000),
      amount: existingPayment.amount * count,
    }

    const result = await db
      .update(schema.payments)
      .set(toUpdate)
      .where(eq(schema.payments.id, Number(txId)))

    if (result.success) {
      await updateDB(c, existingPayment, toUpdate)
    }
  } else {
    console.log(`No existing payment record found for transaction ID: ${txId}`)
    toast.error(`Error top up, website admin has been notified to investigate the issue.`)
    await sendPushNotification(
      `SANDBOX: Error top up, no existing payment record found for transaction ID: ${txId}. Please investigate the issue.`
    )
  }
}

const adjustmentUpdated = async () => {
  await sendPushNotification(
    `SANDBOX: Paddle Adjustment Updated event received. Please check the Paddle dashboard for more details.`
  )
}

const updateDB = async (
  c: CTX,
  payment: { project: string; amount: number; userId: number },
  update: unknown
) => {
  switch (payment.project) {
    case 'notes': {
      const notesDB = getNotesDB(c.env.D1_NOTES)
      const result = await notesDB
        .update(notesSchema.users)
        .set({ creditBalance: sql`${notesSchema.users.creditBalance} + ${payment.amount}` })
        .where(eq(notesSchema.users.id, payment.userId))
      if (!result.success) {
        console.log(
          `Failed to update credit balance for user ID: ${payment.userId} in Notes service`
        )
        await sendPushNotification(
          `Failed to update credit balance for user ID: ${payment.userId} in Notes service. Please investigate the issue.`
        )
      }
      break
    }
    default: {
      const updateData = update as Record<string, unknown>
      console.log(
        `Sending payment update callback for project ${payment.project} with update data: ${JSON.stringify(
          updateData
        )}`
      )
      break
    }
  }
}

export default paddleWebhook
