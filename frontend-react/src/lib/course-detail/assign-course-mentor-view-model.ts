import type { PersonSelectionItem } from '@/lib/types/utils'

export type AssignCourseMentorDialogViewModel = {
  items: PersonSelectionItem[]
  isLoading: boolean
  emptyTitle: string
  emptyDescription: string
  onConfirm: (item: PersonSelectionItem) => Promise<void>
}
