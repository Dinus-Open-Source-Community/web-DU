import type { DeadlineUrgency } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function DeadlineUrgencyBadges({ urgency }: { urgency: DeadlineUrgency }) {
  if (urgency === 'due_soon') return <Badge variant="deadlineDueSoon">Mepet</Badge>
  if (urgency === 'overdue') return <Badge variant="deadlineOverdue">Terlambat</Badge>
  if (urgency === 'closed') return <Badge variant="assignmentClosed">Ditutup</Badge>
  return null
}
