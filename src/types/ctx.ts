import { Context, Input } from 'hono'
import { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../api/db/schema'
import { Bindings } from '@/types/types'

export interface Variables {
  uid: number
  db?: DrizzleD1Database<typeof schema>
}

export type CTX = Context<{ Bindings: Bindings; Variables: Variables }, string, Input>
