import { Badge } from '@/components/ui/badge'
import type { AdminStatus } from '@/lib/types/user'

const STATUS_LABELS: Record<AdminStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  pending: 'Menunggu verifikasi',
}

const STATUS_VARIANTS: Record<AdminStatus, 'userActive' | 'userInactive' | 'userPending'> = {
  active: 'userActive',
  inactive: 'userInactive',
  pending: 'userPending',
}

export function UserStatusBadge({ status }: { status: AdminStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
