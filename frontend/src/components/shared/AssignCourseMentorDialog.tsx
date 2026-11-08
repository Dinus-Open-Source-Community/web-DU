import { UserPlus } from 'lucide-react'

import { UserPromoteDialog } from '@/components/admin/user-manage/UserPromoteDialog'
import type { AssignCourseMentorDialogViewModel } from '@/lib/course-detail/assign-course-mentor-view-model'

export function AssignCourseMentorDialog({
  candidates,
  isLoading,
  emptyTitle,
  emptyDescription,
  onConfirm,
  onOpenChange,
  onSearchChange,
  hasMore,
  isLoadingMore,
  onLoadMore,
  candidateCount,
  candidatesLoading,
}: AssignCourseMentorDialogViewModel) {
  return (
    <UserPromoteDialog
      triggerLabel="Assign mentor"
      triggerIcon={UserPlus}
      title="Tugaskan Mentor"
      description="Pilih satu atau beberapa mentor dari daftar untuk ditambahkan ke kursus ini."
      confirmLabel="Tugaskan Mentor"
      searchPlaceholder="Cari mentor..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      footerHint={(name) => `${name} akan ditugaskan sebagai mentor kursus ini.`}
      candidates={candidates}
      candidateCount={candidateCount}
      candidatesLoading={isLoading || candidatesLoading}
      onOpenChange={onOpenChange}
      onSearchChange={onSearchChange}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
      onConfirm={onConfirm}
    />
  )
}
