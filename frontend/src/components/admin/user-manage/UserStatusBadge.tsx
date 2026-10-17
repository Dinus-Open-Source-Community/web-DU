import { AdminUserStatusLabel } from '@/lib/admin/status-label'
import type { AdminStatus } from '@/lib/types/user'

export function UserStatusBadge({ status }: { status: AdminStatus }) {
  return <AdminUserStatusLabel status={status} />
}
