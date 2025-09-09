import { DisplayMode, Environments, initializePaddle, Theme } from '@paddle/paddle-js'
import { toast } from 'sonner'
import api from '@/app/api/api'
import { CheckoutOpenOptions, getPaddleInstance } from '@paddle/paddle-js'

let paddleInitialized = false

async function setupPaddle(): Promise<void> {
  if (paddleInitialized) {
    console.log('setupPaddle: Paddle already initialized, skipping')
    return
  }

  try {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    const locale = document.documentElement.getAttribute('lang') || 'en'

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
    await initializePaddle(params)
    paddleInitialized = true
    console.log('setupPaddle: Paddle initialized successfully with: ', params)
  } catch (error) {
    console.error('setupPaddle: Failed to initialize Paddle:', error)
    throw error
  }
}

export const initiatePayment = async (
  project: string,
  userId: number,
  amount: number,
  vendor: string,
  returnUrl: string
) => {
  if (!project || !userId || !amount || !vendor || !returnUrl) {
    toast.error('Missing required information to create transaction')
    console.log('handleAddMinutes: Missing required parameters for adding minutes')
    return
  }
  try {
    // Initialize Paddle first
    await setupPaddle()

    const transactionResponse: { success: boolean; body: { id: string } } =
      await api.createTransaction(project, userId, amount, vendor)
    if (!transactionResponse || !transactionResponse.body) {
      throw new Error('Invalid transaction response')
    }

    console.log('handleAddMinutes: Transaction ID:', transactionResponse.body.id)

    const paddleCheckoutObject: CheckoutOpenOptions = {
      settings: {
        displayMode: 'overlay',
        showAddDiscounts: false,
        successUrl: returnUrl,
        variant: 'one-page',
      },
      items: [
        {
          priceId: getPriceIdForAmount(amount),
          quantity: 1,
        },
      ],
      customData: transactionResponse.body,
    }

    try {
      const paddleInstance = getPaddleInstance()
      if (paddleInstance) {
        paddleInstance.Checkout.open(paddleCheckoutObject)
        console.log('handleAddMinutes: Paddle checkout opened successfully:', paddleCheckoutObject)
      } else {
        throw new Error('Paddle instance not available')
      }
    } catch (error) {
      console.log('handleAddMinutes: Error details:', {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack,
      })
      toast.error('Failed to open checkout')
    }
  } catch (error) {
    console.log('handleAddMinutes: Error details:', {
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
    case 10_00:
      return 'pri_01k4emey837kvhk1nvwnb4545h'
    case 25_00:
      return 'pri_01k4emj7c8w9kjnk7r767vkdmk'
    case 50_00:
      return 'pri_01k4emjk4f3q4zrx7mnt94wcs5'
    case 100_00:
      return 'pri_01k4emjzjgmsjc9sqg92k1a5j9'
    default:
      console.log('getPriceIdForAmount: Returning production price ID for amount:', amount)
      throw new Error('Invalid amount for price ID mapping')
  }
}
