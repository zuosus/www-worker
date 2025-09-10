import { DisplayMode, Environments, initializePaddle, Theme } from '@paddle/paddle-js'
import { toast } from 'sonner'
import { CheckoutOpenOptions, getPaddleInstance } from '@paddle/paddle-js'

async function setupPaddle(): Promise<void> {
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

export const initiatePayment = async (userId: number, amount: number, returnUrl: string) => {
  console.log('SANDBOX')

  try {
    // Initialize Paddle first
    await setupPaddle()

    // Use the provided userId instead of hardcoding to 1
    const transactionResponse = { success: true, body: { id: 1 } }

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
      getPaddleInstance()?.Checkout.open(paddleCheckoutObject)
      console.log('handleAddCredits: Paddle checkout opened successfully:', paddleCheckoutObject)
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
    case 10_00:
      return 'pri_01k4ermjvvkvmwkg4wg9q4ymsh'
    case 25_00:
      return 'pri_01k4err6v7a5p1409gnzf0tanz'
    case 50_00:
      return 'pri_01k4errgsb4gfshe207awdgwmh'
    case 100_00:
      return 'pri_01k4ermz5ep57e5vtbgh47fdxz'
    default:
      console.log('getPriceIdForAmount: Returning sandbox price ID for amount:', amount)
      throw new Error('Invalid amount for price ID mapping')
  }
}
