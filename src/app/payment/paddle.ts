import { DisplayMode, Environments, initializePaddle, Theme } from '@paddle/paddle-js'

let paddleInitialized = false

/**
 * Verify Paddle webhook signature (HMAC-SHA256).
 *
 * Paddle signs webhooks using HMAC-SHA256 with your webhook secret.
 * The signature is sent in the 'paddle-signature' header.
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The signature from the 'paddle-signature' header
 * @param secret - Your Paddle webhook secret
 * @returns boolean - True if signature is valid
 */
export async function verifyPaddleSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Create a HMAC-SHA256 hash of the raw body using the secret
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))

    // Convert the signature to hex format
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Compare the signatures in constant time to prevent timing attacks
    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying Paddle webhook signature:', error)
    return false
  }
}

export async function setupPaddle(): Promise<void> {
  console.log('setupPaddle: Starting paddle initialization')
  if (paddleInitialized) {
    console.log('setupPaddle: Paddle already initialized, skipping')
    return
  }

  try {
    console.log('setupPaddle: Getting theme and locale')
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const locale = document.documentElement.getAttribute('lang') || 'en'
    console.log('setupPaddle: Theme:', currentTheme, 'Locale:', locale)

    const params = {
      environment: 'production' as Environments,
      token: 'live_81f44b5e296c9adac7b38fd0ef5',
      checkout: {
        settings: {
          theme: (currentTheme === 'dark' ? 'dark' : 'light') as Theme,
          locale: locale,
          displayMode: 'overlay' as DisplayMode,
        },
      },
    }
    console.log('setupPaddle: Initializing Paddle with :', params)
    await initializePaddle(params)
    paddleInitialized = true
    console.log('setupPaddle: Paddle initialized successfully')
  } catch (error) {
    console.error('setupPaddle: Failed to initialize Paddle:', error)
    throw error
  }
}
