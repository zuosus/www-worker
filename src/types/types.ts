import { Context, Input } from 'hono'

export interface Bindings {
  // bindings
  D1: D1Database
  D1_NOTES: D1Database
  KV: KVNamespace
  R2: R2Bucket
  AI: Ai

  // worker Variables and Secrets
  RESEND_API_KEY: string // Required for email service
  BROWSER: Fetcher

  // secrets store
  JWT_SECRET: {
    get(): Promise<string>
  }
  TURNSTILE_SECRET_KEY: {
    get(): Promise<string>
  }
  PADDLE_WEBHOOK_SECRET: {
    get(): Promise<string>
  }
  PADDLE_API_KEY: {
    get(): Promise<string>
  }
}

export type CTX = Context<{ Bindings: Bindings }, string, Input>
