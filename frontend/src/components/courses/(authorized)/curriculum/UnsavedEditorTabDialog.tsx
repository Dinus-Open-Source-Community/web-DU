import type { CourseEditorTab } from '@/lib/course-edit/types'

import { UnsavedChangesDialog } from './UnsavedChangesDialog'

type UnsavedEditorTabDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTab: CourseEditorTab
  targetTab: CourseEditorTab | null
  isSaving?: boolean
  onSaveAndContinue: () => void
  onDiscardAndContinue: () => void
}

const TAB_LABELS: Record<CourseEditorTab, string> = {
  content: 'Konten',
  homework: 'Tugas',
}

export function UnsavedEditorTabDialog({
  open,
  onOpenChange,
  currentTab,
  targetTab,
  isSaving = false,
  onSaveAndContinue,
  onDiscardAndContinue,
}: UnsavedEditorTabDialogProps) {
  const sectionLabel = currentTab === 'content' ? 'konten lesson' : 'tugas lesson'
  const targetLabel = targetTab ? TAB_LABELS[targetTab] : 'tab lain'

  return (
    <UnsavedChangesDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ada perubahan yang belum disimpan"
      isSaving={isSaving}
      onSaveAndContinue={onSaveAndContinue}
      onDiscardAndContinue={onDiscardAndContinue}
      description={
        <>
          Perubahan pada {sectionLabel} belum disimpan. Simpan atau buang perubahan sebelum pindah
          ke tab <span className="font-medium text-ink-800">{targetLabel}</span>.
        </>
      }
    />
  )
}
