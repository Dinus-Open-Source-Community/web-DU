import type { Metadata } from 'next'
import GuestLayout from '@/components/layout/GuestLayout'
import { getTransactionByUid } from '@/lib/func'
import { InvoiceDetailClient, TransactionNotFound } from './_components/InvoiceDetailClient'

export const metadata: Metadata = {
  title: 'Invoice',
  description: 'Detail invoice dan status pembayaran kursus.',
  robots: { index: false, follow: false },
}

interface InvoiceDetailPageProps {
  params: Promise<{ uid: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { uid } = await params
  const transaction = uid ? getTransactionByUid(uid) : undefined

  if (!transaction) return <TransactionNotFound />

  return (
    <GuestLayout>
      <InvoiceDetailClient transaction={transaction} />
    </GuestLayout>
  )
}
