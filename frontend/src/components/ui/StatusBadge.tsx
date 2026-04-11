import { PaymentStatus } from '@/lib/types'
import { statusLabels, statusStyles } from '@/lib/dummyData'

interface StatusBadgeProps {
  status: PaymentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
