export interface Bindings {
  // bindings
  D1: D1Database
  KV: KVNamespace
  R2: R2Bucket
  AI: Ai

  // worker Variables and Secrets
  RESEND_API_KEY: string // Required for email service
  UPLOADS: R2Bucket
  BROWSER: Fetcher

  JWT_SECRET: {
    get(): Promise<string | null>
  }
  TURNSTILE_SECRET_KEY: {
    get(): Promise<string | null>
  }
}
