import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export function TransactionPaymentForbidden({ backHref }: { backHref?: string }) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50">
        <ShieldAlert className="size-8 text-amber-500" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        Akses ditolak
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        Anda tidak memiliki izin untuk melihat detail pembayaran ini. Pastikan referensi transaksi milik akun Anda.
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
