import { AdminEmailVerificationLabel } from '@/lib/admin/status-label'

export function UserStatusBadge({ isVerified }: { isVerified: boolean }) {
  return <AdminEmailVerificationLabel isVerified={isVerified} />
}
