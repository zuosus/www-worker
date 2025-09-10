'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { initiatePayment } from './paddle'
import { CreditCard, CheckCircle, Sparkles, Clock, Infinity, FileText, Zap } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPageClient({
  returnUrl,
  userId,
}: {
  returnUrl: string
  userId: number
}) {
  const [isLoading, setIsLoading] = useState<number | null>(null)

  const creditPackages = [
    {
      amount: 10_00,
      credits: 100,
      popular: false,
      description: 'Perfect for occasional meetings',
      features: ['100 minutes of live transcription', 'AI-powered summarization'],
    },
    {
      amount: 25_00,
      credits: 250,
      popular: false,
      description: 'Great for regular users',
      features: ['250 minutes of live transcription', 'AI-powered summarization'],
    },
    {
      amount: 50_00,
      credits: 500,
      popular: true,
      description: 'Most selected',
      features: ['500 minutes of live transcription', 'AI-powered summarization'],
    },
    {
      amount: 100_00,
      credits: 1000,
      popular: false,
      description: 'For heavy users',
      features: ['1,000 minutes of live transcription', 'AI-powered summarization'],
    },
  ]

  const handlePurchase = (amount: number) => {
    setIsLoading(amount)
    initiatePayment(userId, amount, returnUrl)
      .catch((error) => {
        toast.error('Failed to initiate payment. Please try again.')
        console.error('Payment error:', error)
      })
      .finally(() => {
        setIsLoading(null)
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Sandbox</h1>
          <h1 className="text-4xl font-bold text-foreground mb-4">Meeting Notes</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4">Minutes Packages</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your meetings into actionable insights with our AI-powered live transcription
            service. Stream your meeting directly and get real-time transcription and summaries.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.amount}
              className={`flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                pkg.popular
                  ? 'border-primary ring-2 ring-primary/20 relative transform md:-translate-y-2'
                  : 'border-border'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">
                  ${(pkg.amount / 100).toFixed(2)}
                </CardTitle>
                <CardDescription className="text-lg font-medium text-foreground">
                  {pkg.credits.toLocaleString()} minutes
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
              </CardHeader>
              <CardContent className="flex-grow pb-4">
                <div className="space-y-3">
                  <div className="text-center text-sm text-muted-foreground">
                    <p className="font-medium">$0.10 per minute</p>
                  </div>

                  <ul className="space-y-2 mt-4">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handlePurchase(pkg.amount)}
                  className="w-full"
                  size="lg"
                  disabled={isLoading === pkg.amount}
                >
                  {isLoading === pkg.amount ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
            <Clock className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Never Expire</h3>
            <p className="text-muted-foreground">
              Your minutes never expire. Use them whenever you need them for live meetings.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
            <Infinity className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Flexible Usage</h3>
            <p className="text-muted-foreground">
              Use minutes for live meetings, interviews, lectures, and more.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
            <Zap className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
            <p className="text-muted-foreground">
              Minutes are available immediately after successful payment.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How Minutes Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1">Start Live Stream</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your meeting directly to our service
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1">AI Processing</h3>
                <p className="text-sm text-muted-foreground">Our AI transcribes and summarizes</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1">Minutes Deducted</h3>
                <p className="text-sm text-muted-foreground">1 minute = 1 minute of meeting time</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-1">Get Insights</h3>
                <p className="text-sm text-muted-foreground">Access your transcript and summary</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-6 bg-card rounded-xl border border-border p-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Secure payments processed by</span>
            <div className="font-semibold">Paddle</div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Your minutes will be available immediately after payment completion
          </p>
        </div>

        {/* No Refund Policy */}
        <Card className="mb-8 border-muted bg-muted/50 max-w-2xl mx-auto">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              No Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              All credits purchased are non-refundable. We do not issue refunds for any reason once
              credits have been purchased.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
