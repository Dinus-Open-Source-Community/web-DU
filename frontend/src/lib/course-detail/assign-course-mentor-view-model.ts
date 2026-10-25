import type { PromoteCandidate } from '@/lib/user-manage/view-models'

export type AssignCourseMentorDialogViewModel = {
  candidates: PromoteCandidate[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
  onConfirm: (uids: string[]) => Promise<void>
  onOpenChange: (open: boolean) => void
  onSearchChange: (value: string) => void
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  candidateCount?: number
  candidatesLoading: boolean
}
