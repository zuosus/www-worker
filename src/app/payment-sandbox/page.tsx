'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { initiatePaymentSandbox } from './paddle-sandbox'

export default function CreditsCard() {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-lg">Make a Payment</h3>
      </div>

      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-lg">Make a Payment</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-2">Make a Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Credits to Your Account</DialogTitle>
              <DialogDescription>Select an amount to add to your balance</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {[1_000, 2_500, 5_000, 10_000].map((amount) => (
                <p key={amount}>
                  <DialogClose asChild>
                    <Button
                      key={'sandbox ' + amount}
                      onClick={() => {
                        void initiatePaymentSandbox(amount)
                      }}
                      className="justify-between h-20 flex flex-col items-center"
                      variant="secondary"
                    >
                      <span className="font-bold">SANDBOX ${amount / 100}</span>
                    </Button>
                  </DialogClose>
                </p>
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
