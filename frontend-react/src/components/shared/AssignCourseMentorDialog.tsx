import { useMemo } from 'react'
import { UserPlus } from 'lucide-react'

import { PersonSelectionDialog } from '@/components/shared/PersonSelection'
import { Badge } from '@/components/ui/badge'
import type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'

export function AssignCourseMentorDialog({
  items,
  emptyTitle,
  emptyDescription,
  onConfirm,
}: AssignCourseMentorDialogViewModel) {
  const itemsWithMeta = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        meta: <Badge variant="userRole">Mentor</Badge>,
      })),
    [items],
  )

  return (
    <PersonSelectionDialog
      triggerLabel="Assign mentor"
      triggerIcon={UserPlus}
      title="Tugaskan mentor"
      description="Pilih mentor yang akan ditambahkan ke tim pengajar kursus ini."
      confirmLabel="Tugaskan mentor"
      searchPlaceholder="Cari nama, email, atau ID mentor..."
      items={itemsWithMeta}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      renderFooterHint={(item) => (
        <span>
          <strong className="font-semibold text-slate-900">{item.name}</strong> akan ditugaskan sebagai
          mentor kursus.
        </span>
      )}
      onConfirm={onConfirm}
    />
  )
}
