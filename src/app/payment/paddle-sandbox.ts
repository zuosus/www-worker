import { DisplayMode, Environments, initializePaddle, Theme } from '@paddle/paddle-js'
import { toast } from 'sonner'
import api from '../api/api'
import { CheckoutOpenOptions, getPaddleInstance } from '@paddle/paddle-js'

export async function setupPaddle(): Promise<void> {
  console.log('SANDBOX')

  try {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const locale = document.documentElement.getAttribute('lang') || 'en'

    const params = {
      environment: 'sandbox' as Environments,
      token: 'test_3d93f0977cdcd4f91304eead0d8',
      checkout: {
        settings: {
          theme: (currentTheme === 'dark' ? 'dark' : 'light') as Theme,
          locale: locale,
          displayMode: 'overlay' as DisplayMode,
        },
      },
    }
    await initializePaddle(params)
    console.log('setupPaddle: Paddle initialized successfully with: ', params)
  } catch (error) {
    console.error('setupPaddle: Failed to initialize Paddle:', error)
    throw error
  }
}

export const initiatePaymentSandbox = async (
  project: string,
  userId: number,
  amount: number,
  vendor: string
) => {
  project = 'sandbox'
  userId = 1
  vendor = 'paddle'
  if (!project || !userId || !amount || !vendor) {
    toast.error('Missing required information to create transaction')
    console.log('handleAddCredits: Missing required parameters for adding credits')
    return
  }
  try {
    // Initialize Paddle first
    await setupPaddle()

    const transaction = await api.createTransaction(project, userId, amount * 100, vendor)
    console.log('handleAddCredits: Transaction ID:', transaction.body?.id)

    const paddleCheckoutObject: CheckoutOpenOptions = {
      settings: {
        displayMode: 'overlay',
      },
      items: [
        {
          priceId: getPriceIdForAmount(amount),
          quantity: 1,
        },
      ],
      customData: transaction.body,
    }

    try {
      getPaddleInstance()?.Checkout.open(paddleCheckoutObject)
      console.log('handleAddCredits: Paddle checkout opened successfully')
    } catch (error) {
      console.log('handleAddCredits: Error details:', {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack,
      })
      toast.error('Failed to open checkout')
    }
  } catch (error) {
    console.log('handleAddCredits: Error details:', {
      message: (error as Error).message,
      name: (error as Error).name,
      stack: (error as Error).stack,
    })
    toast.error('Failed to create transaction')
  }
}

const getPriceIdForAmount = (amount: number): string => {
  console.log('getPriceIdForAmount: Getting price ID for amount:', amount)
  switch (amount) {
    case 10:
      return 'pri_01k4ermjvvkvmwkg4wg9q4ymsh'
    case 25:
      return 'pri_01k4err6v7a5p1409gnzf0tanz'
    case 50:
      return 'pri_01k4errgsb4gfshe207awdgwmh'
    case 100:
      return 'pri_01k4ermz5ep57e5vtbgh47fdxz'
    default:
      console.log('getPriceIdForAmount: Returning sandbox price ID for amount:', amount)
      throw new Error('Invalid amount for price ID mapping')
  }
}
