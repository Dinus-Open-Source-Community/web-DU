import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import type { CourseEditorTab } from '@/lib/course-edit/types'
import { editLayout } from '@/components/courses/(authorized)/curriculum/edit-layout'

type CourseEditStickySaveBarProps = {
  editorTab: CourseEditorTab
  isSaving: boolean
  isPublishing: boolean
  hasUnsavedLesson: boolean
  hasUnsavedAssignment: boolean
  canSaveAssignment: boolean
  isAdmin: boolean
  isPublished: boolean
  onSaveLesson: () => void
  onSaveAssignment: () => void
  onPublish: () => void
  onDeleteLesson: () => void
  onDeleteAssignment: () => void
}

export function CourseEditStickySaveBar({
  editorTab,
  isSaving,
  isPublishing,
  hasUnsavedLesson,
  hasUnsavedAssignment,
  canSaveAssignment,
  isAdmin,
  isPublished,
  onSaveLesson,
  onSaveAssignment,
  onPublish,
  onDeleteLesson,
  onDeleteAssignment,
}: CourseEditStickySaveBarProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const isHomeworkTab = editorTab === 'homework'
  const hasUnsavedChanges = isHomeworkTab ? hasUnsavedAssignment : hasUnsavedLesson
  const saveDisabled = isHomeworkTab
    ? isSaving || !hasUnsavedAssignment || !canSaveAssignment
    : isSaving || !hasUnsavedLesson

  const handleSave = () => {
    if (isHomeworkTab) {
      onSaveAssignment()
      return
    }
    onSaveLesson()
  }

  const handleConfirmDelete = () => {
    if (isHomeworkTab) {
      onDeleteAssignment()
    } else {
      onDeleteLesson()
    }
    setConfirmDeleteOpen(false)
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-white/85 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {hasUnsavedChanges && (
            <p className="min-w-0 flex-1 text-xs font-medium text-amber-700 sm:text-sm">
              Belum disimpan
            </p>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {!isPublished && isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={editLayout.control}
                disabled={isSaving || isPublishing}
                onClick={onPublish}
              >
                {isPublishing ? 'Menerbitkan...' : 'Terbitkan'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${editLayout.control} gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700`}
              disabled={isSaving}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" aria-hidden />
              {isHomeworkTab ? 'Hapus tugas' : 'Hapus lesson'}
            </Button>

            <Button
              type="button"
              size="sm"
              className={`${editLayout.control} min-w-[8.5rem]`}
              disabled={saveDisabled}
              onClick={handleSave}
            >
              {isSaving
                ? 'Menyimpan...'
                : isHomeworkTab
                  ? 'Simpan tugas'
                  : 'Simpan lesson'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={isHomeworkTab ? 'Hapus tugas lesson?' : 'Hapus lesson ini?'}
        description={
          isHomeworkTab
            ? 'Konfigurasi tugas dan aturan pengumpulan akan dihapus. Peserta tidak lagi bisa mengumpulkan.'
            : 'Konten dan tugas lesson akan dihapus dari kurikulum. Perubahan disimpan setelah Anda menekan Simpan.'
        }
        confirmLabel={isHomeworkTab ? 'Hapus tugas' : 'Hapus'}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
