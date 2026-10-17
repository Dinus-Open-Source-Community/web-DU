import { UnsavedChangesDialog } from './UnsavedChangesDialog'

type UnsavedLessonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonTitle: string
  targetLabel: string
  isSaving?: boolean
  onSaveAndContinue: () => void
  onDiscardAndContinue: () => void
}

export function UnsavedLessonDialog({
  open,
  onOpenChange,
  lessonTitle,
  targetLabel,
  isSaving = false,
  onSaveAndContinue,
  onDiscardAndContinue,
}: UnsavedLessonDialogProps) {
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
          <span className="font-medium text-ink-800">{lessonTitle}</span> masih memiliki perubahan
          yang belum disimpan. Simpan atau buang perubahan sebelum {targetLabel}.
        </>
      }
    />
  )
}
