import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { NothingTransactionLottieIllustration } from '@/components/playful/NothingTransactionLottieIllustration'
import { appCardClassName } from '@/lib/design/app-shell-tokens'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

type AdminDashboardTransactionsEmptyProps = {
  className?: string
}

export function AdminDashboardTransactionsEmpty({ className }: AdminDashboardTransactionsEmptyProps) {
  return (
    <div
      className={cn(
        appCardClassName,
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      <NothingTransactionLottieIllustration className="mb-2" height="220px" />
      <h3 className="text-base font-semibold text-ink-900">Belum ada aktivitas transaksi</h3>
      <p className="mt-1.5 max-w-md text-sm font-medium leading-relaxed text-ink-500">
        Grafik dan daftar transaksi akan muncul setelah ada pembayaran kursus di platform.
      </p>
      <Link
        to={ROUTES.admin.dashboard}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        Buka halaman transaksi
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  )
}
