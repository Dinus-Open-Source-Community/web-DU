import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { SafeLottie } from '@/components/ui/lottie'
import { ROUTES } from '@/lib/routes'

export function TransactionPaymentNotFound({ backHref }: { backHref?: string }) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="size-48">
        <SafeLottie src="/transaction-not-found.lottie" loop={false} />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        Pembayaran tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        Data pembayaran tidak tersedia. Kembali ke riwayat untuk memilih transaksi lain.
      </p>
      <Button asChild size="lg" className="mt-6 min-h-11 px-5">
        <Link to={backHref ?? ROUTES.student.transactions}>
          <ArrowLeft className="size-4" aria-hidden data-icon="inline-start" />
          Kembali ke riwayat
        </Link>
      </Button>
    </section>
  )
}
