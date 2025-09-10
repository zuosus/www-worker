import { notFound } from 'next/navigation'

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Validate the return_url parameter on the server side
  const params = await searchParams
  const returnUrl = params.return_url
  const userId = params.user_id as number | undefined

  if (!returnUrl || !userId || Array.isArray(returnUrl)) {
    notFound()
  }

  const PaymentPageClient = (await import('./payment-client')).default

  return <PaymentPageClient returnUrl={returnUrl} userId={userId} />
}
