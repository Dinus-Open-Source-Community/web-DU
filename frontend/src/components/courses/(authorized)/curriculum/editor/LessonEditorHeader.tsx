import { useEffect, useState } from 'react'
import { ClipboardCheck, ClipboardList, FileText, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CourseEditorTab } from '@/lib/course-edit/types'
import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'
import { LessonTitleRenameField } from './LessonTitleRenameField'

type LessonEditorHeaderProps = {
  lessonId: string
  lessonTitle: string
  moduleLabel?: string
  lessonOrder?: number
  editorTab: CourseEditorTab
  hasHomework: boolean
  isCompact?: boolean
  onEditorTabChange: (tab: CourseEditorTab) => void
  onRenameLesson: (lessonId: string, title: string) => void | Promise<void>
}

export function LessonEditorHeader({
  lessonId,
  lessonTitle,
  moduleLabel,
  lessonOrder,
  editorTab,
  hasHomework,
  isCompact = false,
  onEditorTabChange,
  onRenameLesson,
}: LessonEditorHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  useEffect(() => {
    setIsRenaming(false)
    setIsSavingTitle(false)
  }, [lessonId, lessonTitle])

  const handleSave = async (title: string) => {
    if (title === lessonTitle) {
      setIsRenaming(false)
      return
    }

    setIsSavingTitle(true)
    try {
      await onRenameLesson(lessonId, title)
      setIsRenaming(false)
    } catch {
      // Error toast handled in controller.
    } finally {
      setIsSavingTitle(false)
    }
  }

  return (
    <header className="space-y-4">
      {!isCompact && (
        <div className="min-w-0 space-y-2">
          {moduleLabel && (
            <p className={editLayout.fieldLabel}>
              {moduleLabel}
              {typeof lessonOrder === 'number' ? ` · Lesson ${lessonOrder}` : ''}
            </p>
          )}

          {isRenaming ? (
            <LessonTitleRenameField
              lessonId={lessonId}
              title={lessonTitle}
              isSaving={isSavingTitle}
              onSave={handleSave}
              onCancel={() => setIsRenaming(false)}
            />
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className={cn('min-w-0 break-words', editLayout.sectionTitle)}>
                {lessonTitle}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(editLayout.control, 'w-full shrink-0 gap-1.5 sm:w-auto')}
                onClick={() => setIsRenaming(true)}
              >
                <Pencil className="size-3.5" aria-hidden />
                Ubah nama
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="w-full border-b-2 border-ink-900/10">
        <div
          role="tablist"
          aria-label="Navigasi konten dan tugas lesson"
          className="inline-flex h-auto w-max min-w-full flex-nowrap"
        >
          <button
            type="button"
            role="tab"
            aria-selected={editorTab === 'content'}
            onClick={() => onEditorTabChange('content')}
            className={cn(
              '-mb-0.5 inline-flex min-h-11 shrink-0 snap-start items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:min-h-10 sm:px-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
              editorTab === 'content'
                ? 'border-brand-blue text-ink-900 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
                editorTab === 'content'
                  ? 'border-brand-blue/30 bg-brand-blue/15 text-brand-blue'
                  : 'border-line-light bg-paper-paper text-ink-400',
              )}
            >
              <FileText className="size-3.5" aria-hidden />
            </span>
            <span>Konten</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={editorTab === 'homework'}
            onClick={() => onEditorTabChange('homework')}
            className={cn(
              '-mb-0.5 inline-flex min-h-11 shrink-0 snap-start items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:min-h-10 sm:px-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
              editorTab === 'homework'
                ? 'border-brand-blue text-ink-900 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
                hasHomework
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600'
                  : editorTab === 'homework'
                    ? 'border-brand-blue/30 bg-brand-blue/15 text-brand-blue'
                    : 'border-line-light bg-paper-paper text-ink-400',
              )}
            >
              {hasHomework ? (
                <ClipboardCheck className="size-3.5 stroke-[2.2]" aria-hidden />
              ) : (
                <ClipboardList className="size-3.5" aria-hidden />
              )}
            </span>
            <span>Tugas</span>
          </button>
        </div>
      </div>
    </header>
  )
}
