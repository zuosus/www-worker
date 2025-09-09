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
        <h3 className="font-medium text-lg">Make a Payment</h3>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-lg">Make a Payment</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mt-2">Make a Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits to Your Account</DialogTitle>
              <DialogDescription>Select an amount to add to your balance</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {[1_000, 2_500, 5_000, 10_000].map((amount) => (
                <>
                  <Button
                    key={amount}
                    onClick={() => {
                      void initiatePayment('notes', 2, amount, 'paddle')
                    }}
                    className="w-full justify-between h-20 flex flex-col items-center"
                    variant="outline"
                  >
                    <span className="font-bold">${amount/100}</span>
                  </Button>
                  <Button
                    key={amount}
                    onClick={() => {
                      void initiatePaymentSandbox('sandbox', 1, amount, 'paddle')
                    }}
                    className="w-full justify-between h-20 flex flex-col items-center"
                    variant="outline"
                  >
                    <span className="font-bold">SANDBOX ${ amount/100}</span>
                  </Button>
                  <br />
                </>
              ))}
            </div>
            <DialogFooter className="sm:justify-start">
              <p className="text-sm text-muted-foreground">Secure payments processed by Paddle</p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}
