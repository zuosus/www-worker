import { CTX } from '../types/ctx'

export class PlatformKV {
  private kv: KVNamespace

  constructor(c: CTX) {
    this.kv = c.env.KV
  }

  async get<T = unknown>(
    key: string,
    type?: 'text' | 'json' | 'arrayBuffer' | 'stream'
  ): Promise<T | null> {
    if (type === 'json') {
      const result = await this.kv.get(key, 'text')
      return result ? (JSON.parse(result) as T) : null
    }
    if (type === 'arrayBuffer') {
      return (await this.kv.get(key, type)) as T | null
    }
    if (type === 'stream') {
      return (await this.kv.get(key, type)) as T | null
    }
    // Default to text
    return (await this.kv.get(key, 'text')) as T | null
  }

  async put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: { expiration?: number; expirationTtl?: number; metadata?: unknown }
  ): Promise<void> {
    await this.kv.put(key, value, options)
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key)
  }
}
