import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Payment history (credit purchases)
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  project: text('project').notNull().default(''), // Project identifier
  userId: integer('user_id').notNull(),
  amount: integer('amount').notNull(), // Payment amount in cents (USD)
  vendor: text('vendor').notNull(), // paddle, etc.
  vendorId: text('vendor_id').notNull().default(''), // External payment ID
  status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

// Export an empty object for other schemas (to be added later)
export {}
