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
import { initiatePayment } from './paddle'
import { initiatePaymentSandbox } from './paddle-sandbox'

export default function CreditsCard() {
  const [creditBalance] = useState<number>(0)
  const [loadingCredits] = useState(true)

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
                <>
                  <Button
                    key={amount}
                    onClick={() => {
                      void initiatePayment('notes', 2, amount, 'paddle')
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
                  <Button
                    key={amount}
                    onClick={() => {
                      void initiatePaymentSandbox('sandbox', 1, amount, 'paddle')
                    }}
                    className="w-full justify-between h-20 flex flex-col items-center"
                    variant="outline"
                  >
                    <span className="font-bold">${'sandbox' + amount.toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm">
                      {amount === 10 && '(100 minutes)'}
                      {amount === 25 && '(250 minutes)'}
                      {amount === 50 && '(500 minutes)'}
                      {amount === 100 && '(1000 minutes)'}
                    </span>
                  </Button>
                </>
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
