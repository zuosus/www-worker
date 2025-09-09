// Import PDF generation functions
import { generatePDF } from './services/pdf-generator'

// Import email functions
import { sendEmail, EmailTemplate, EmailOptions } from './services/email'

// Import push notification functions
import { sendPushNotification } from './services/push-notification'

import { WorkerEntrypoint } from 'cloudflare:workers'
import { HTTPException } from 'hono/http-exception'
import { Bindings } from '@/types/types'

// Define the file upload type
interface UploadedFile {
  name: string
  type: string
  data: ArrayBuffer
}

export default class Services extends WorkerEntrypoint<Bindings> {
  // Define the RPC service with proper 'this' typing
  async generatePDF(options: {
    title: string
    sessionId: string
    createdAt: string
    content: string
  }): Promise<ArrayBuffer> {
    return generatePDF(this.env, options)
  }

  async sendEmail(
    template: EmailTemplate,
    options: EmailOptions = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return sendEmail(template, this.env, options)
  }

  async sendPushNotification(pushContent: string): Promise<{ success: boolean; message?: string }> {
    return sendPushNotification(pushContent)
  }

  async uploadFiles(files: UploadedFile[]): Promise<{ success: boolean; count: number }> {
    for (const f of files) {
      console.log(`Got file: ${f.name} (${f.type}), size=${f.data.byteLength}`)
      await this.env.R2.put(f.name, f.data)
    }

    return { success: true, count: files.length }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  async fetch(_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> {
    throw new HTTPException(500, {
      message: 'This service does not support fetch requests.',
    })
  }
}
