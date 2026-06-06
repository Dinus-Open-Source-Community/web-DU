import { useEffect, useState, type KeyboardEvent } from 'react'
import { Check, ClipboardList, Pencil, Trash2, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CourseEditorTab } from '@/lib/course-edit/types'
import { cn } from '@/lib/utils'

import { editLayout } from '../edit-layout'
import { editMotion } from './edit-motion'

type LessonEditorHeaderProps = {
  lessonId: string
  lessonTitle: string
  moduleLabel?: string
  lessonOrder?: number
  editorTab: CourseEditorTab
  hasHomework: boolean
  onEditorTabChange: (tab: CourseEditorTab) => void
  onRenameLesson: (lessonId: string, title: string) => void
  onDeleteLesson: (lessonId: string) => void
}

export function LessonEditorHeader({
  lessonId,
  lessonTitle,
  moduleLabel,
  lessonOrder,
  editorTab,
  hasHomework,
  onEditorTabChange,
  onRenameLesson,
  onDeleteLesson,
}: LessonEditorHeaderProps) {
  const [draftTitle, setDraftTitle] = useState(lessonTitle)
  const [isRenaming, setIsRenaming] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    setDraftTitle(lessonTitle)
    setIsRenaming(false)
  }, [lessonId, lessonTitle])

  const cancelRename = () => {
    setDraftTitle(lessonTitle)
    setIsRenaming(false)
  }

  const commitRename = () => {
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      cancelRename()
      return
    }
    if (trimmed !== lessonTitle) {
      onRenameLesson(lessonId, trimmed)
    }
    setIsRenaming(false)
  }

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitRename()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelRename()
    }
  }

  return (
    <>
      <header className={`space-y-4 pb-5 ${editLayout.divider}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {moduleLabel && (
              <p className={editLayout.fieldLabel}>
                {moduleLabel}
                {typeof lessonOrder === 'number' ? ` · Lesson ${lessonOrder}` : ''}
              </p>
            )}

            {isRenaming ? (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={`lesson-title-${lessonId}`} className="sr-only">
                  Nama lesson
                </label>
                <input
                  id={`lesson-title-${lessonId}`}
                  autoFocus
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  className={cn(
                    editLayout.control,
                    'min-w-[12rem] flex-1 border border-slate-200 bg-white px-3 font-semibold text-slate-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                  )}
                />
                <Button
                  type="button"
                  size="sm"
                  className={cn(editLayout.control, 'gap-1.5 px-3')}
                  onClick={commitRename}
                >
                  <Check className="size-3.5" aria-hidden />
                  Simpan
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(editLayout.control, 'gap-1.5 px-3')}
                  onClick={cancelRename}
                >
                  <X className="size-3.5" aria-hidden />
                  Batal
                </Button>
              </div>
            ) : (
              <h2 className={cn('truncate', editLayout.sectionTitle)}>{lessonTitle}</h2>
            )}
          </div>

          {!isRenaming && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(editLayout.control, 'gap-1.5 px-3')}
                onClick={() => setIsRenaming(true)}
              >
                <Pencil className="size-3.5" aria-hidden />
                Ubah nama
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  editLayout.control,
                  'gap-1.5 border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700',
                )}
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Hapus lesson
              </Button>
            </div>
          )}
        </div>

        <Tabs
          value={editorTab}
          onValueChange={(value) => onEditorTabChange(value as CourseEditorTab)}
          className="gap-0"
        >
          <TabsList variant="line" className="h-9 w-full bg-transparent p-0 sm:w-auto">
            <TabsTrigger
              value="content"
              className="px-0 text-sm font-medium transition-colors duration-200"
            >
              Konten
            </TabsTrigger>
            <TabsTrigger
              value="homework"
              className="ml-6 gap-1.5 px-0 text-sm font-medium transition-colors duration-200"
            >
              <ClipboardList className="size-4" aria-hidden />
              Tugas
              {hasHomework && (
                <span
                  className={cn(
                    'ml-1 size-1.5 rounded-full bg-primary',
                    'animate-in fade-in zoom-in-95 duration-200',
                    editMotion.reducedMotion,
                  )}
                  aria-label="Tugas sudah diisi"
                />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Hapus lesson ini?"
        description="Konten dan tugas lesson akan dihapus dari kurikulum. Perubahan disimpan setelah Anda menekan Simpan."
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={() => {
          onDeleteLesson(lessonId)
          setConfirmDeleteOpen(false)
        }}
      />
    </>
  )
}
