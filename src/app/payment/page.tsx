'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { setupPaddle } from './paddle'
import api from '../api/api'
import { CheckoutOpenOptions, getPaddleInstance } from '@paddle/paddle-js'

export default function CreditsCard() {
  const [creditBalance] = useState<number>(0)
  const [loadingCredits] = useState(true)

  const getPriceIdForAmount = (amount: number): string => {
    console.log('getPriceIdForAmount: Getting price ID for amount:', amount)
    switch (amount) {
      case 10:
        return 'pri_01k4emey837kvhk1nvwnb4545h'
      case 25:
        return 'pri_01k4emj7c8w9kjnk7r767vkdmk'
      case 50:
        return 'pri_01k4emjk4f3q4zrx7mnt94wcs5'
      case 100:
        return 'pri_01k4emjzjgmsjc9sqg92k1a5j9'
      default:
        console.log('getPriceIdForAmount: Returning production price ID for amount:', amount)
        throw new Error('Invalid amount for price ID mapping')
    }
  }

  const handleAddCredits = async (
    project: string,
    userId: number,
    amount: number,
    vendor: string
  ) => {
    if (!project || !userId || !amount || !vendor) {
      toast.error('Missing required information to create transaction')
      console.log('handleAddCredits: Missing required parameters for adding credits')
      return
    }
    try {
      // Initialize Paddle first
      console.log('handleAddCredits: Initializing Paddle')
      await setupPaddle()
      console.log('handleAddCredits: Paddle initialized successfully')

      console.log('handleAddCredits: Creating transaction for amount:', amount * 100)
      const transaction = await api.createTransaction(project, userId, amount * 100, vendor)
      console.log('handleAddCredits: Transaction created:', transaction)

      // Open Paddle Checkout using the new SDK
      console.log('handleAddCredits: Preparing to open Paddle checkout')
      console.log('handleAddCredits: Price ID for amount:', getPriceIdForAmount(amount))
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
      console.log('handleAddCredits: Paddle checkout object prepared:', paddleCheckoutObject)
      try {
        const Paddle = getPaddleInstance()
        console.log(
          'handleAddCredits: Paddle Checkout open function:',
          typeof Paddle?.Checkout.open === 'function'
        )
        Paddle?.Checkout.open(paddleCheckoutObject)
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

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-lg">Current Balance</h3>
        <p className="text-2xl font-bold text-green-600">
          {loadingCredits ? 'Loading...' : `$${((creditBalance || 0) / 100).toFixed(2)}`}
        </p>
        <p className="text-sm text-muted-foreground">Available credits</p>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-lg">Add Credits</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mt-2">Add Credits</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits to Your Account</DialogTitle>
              <DialogDescription>Select an amount to add to your balance</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => {
                    void handleAddCredits('notes', 2, amount, 'paddle')
                  }}
                  className="w-full justify-between h-20 flex flex-col items-center"
                  variant="outline"
                >
                  <span className="font-bold">${amount.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm">
                    {amount === 10 && '(100 minutes)'}
                    {amount === 25 && '(250 minutes)'}
                    {amount === 50 && '(500 minutes)'}
                    {amount === 100 && '(1000 minutes)'}
                  </span>
                </Button>
              ))}
            </div>
            <DialogFooter className="sm:justify-start">
              <p className="text-sm text-muted-foreground">Secure payments processed by Paddle</p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          • Each minute of transcription costs $
          {parseFloat(process.env.NEXT_PUBLIC_PRICE_PER_MINUTE || '0.10').toFixed(2)}
        </p>
        <p>
          • You need at least $
          {(5 * parseFloat(process.env.NEXT_PUBLIC_PRICE_PER_MINUTE || '0.10')).toFixed(2)} credits
          to start a new meeting
        </p>
      </div>
    </div>
  )
}
