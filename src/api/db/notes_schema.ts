import { sqliteTable, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  creditBalance: integer('credit_balance').notNull().default(0),
})
