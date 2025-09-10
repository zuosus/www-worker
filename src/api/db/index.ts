import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import * as notesSchema from './notes_schema'

export function getDB(d1: D1Database) {
  return drizzle(d1, { schema })
}

export function getNotesDB(d1: D1Database) {
  return drizzle(d1, { schema: notesSchema })
}
