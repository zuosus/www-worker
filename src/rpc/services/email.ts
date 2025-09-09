export interface EmailTemplate {
  to: string
  subject: string
  html?: string
  text?: string
}

export interface EmailOptions {
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

/**
 * Send email using Resend.com API
 */
async function postResend(env: { RESEND_API_KEY: string }, payload: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  let json: unknown
  try {
    json = text ? JSON.parse(text) : undefined
  } catch {
    json = text
  }
  return { res, json }
}

export async function sendEmail(
  template: EmailTemplate,
  env: { RESEND_API_KEY: string },
  options: EmailOptions = {}
): Promise<{ success: boolean; id?: string; error?: string }> {
  console.log(`[Email] Sending email to: ${template.to} with subject: ${template.subject}`)

  try {
    if (!env.RESEND_API_KEY) {
      throw new Error('Resend API key is not configured')
    }

    const payload: Record<string, unknown> = {
      from: options?.from || 'no_reply@zuos.us',
      to: [template.to],
      subject: template.subject,
    }

    if (template.html) payload.html = template.html
    if (template.text) payload.text = template.text

    if (options.replyTo) {
      payload.reply_to = Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo]
    }
    if (options.cc?.length) payload.cc = options.cc
    if (options.bcc?.length) payload.bcc = options.bcc

    if (!payload.html && !payload.text) {
      throw new Error('Email must have either HTML or text content')
    }

    const { res, json } = await postResend(env, payload)
    console.log(`[Email] Resend API response status: ${res.status}`)

    if (
      res.ok &&
      (res.status === 201 || res.status === 200) &&
      json &&
      typeof json === 'object' &&
      'id' in json &&
      typeof json.id === 'string'
    ) {
      console.log(`[Email] Successfully sent email with ID: ${json.id}`)
      return { success: true, id: json.id }
    }

    const message =
      (json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
        ? json.message
        : '') ||
      (json &&
      typeof json === 'object' &&
      'error' in json &&
      json.error &&
      typeof json.error === 'object' &&
      'message' in json.error &&
      typeof json.error.message === 'string'
        ? json.error.message
        : '') ||
      `Resend HTTP ${res.status}`

    console.log(`[Email] Failed to send email. Error: ${message}`)
    return { success: false, error: message }
  } catch (error: unknown) {
    console.log(
      `[Email] Exception occurred while sending email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
