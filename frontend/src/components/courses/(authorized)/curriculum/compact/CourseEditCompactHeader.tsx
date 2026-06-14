import { useEffect, useState } from 'react'
import { ChevronLeft, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { editLayout } from '@/components/courses/(authorized)/curriculum/edit-layout'
import { LessonTitleRenameField } from '@/components/courses/(authorized)/curriculum/editor/LessonTitleRenameField'

type CourseEditCompactHeaderProps = {
  lessonId: string
  lessonTitle: string
  moduleLabel?: string
  onBackToOutline: () => void
  onRenameLesson: (lessonId: string, title: string) => void | Promise<void>
}

export function CourseEditCompactHeader({
  lessonId,
  lessonTitle,
  moduleLabel,
  onBackToOutline,
  onRenameLesson,
}: CourseEditCompactHeaderProps) {
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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 py-3 backdrop-blur-sm supports-backdrop-filter:bg-white/80 lg:hidden">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`${editLayout.control} -ml-2 shrink-0 gap-1 px-2 text-slate-700`}
          onClick={onBackToOutline}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Kurikulum
        </Button>
      </div>

      <div className="mt-2 flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {moduleLabel && <p className={editLayout.fieldLabel}>{moduleLabel}</p>}

          {isRenaming ? (
            <LessonTitleRenameField
              lessonId={lessonId}
              title={lessonTitle}
              compact
              isSaving={isSavingTitle}
              onSave={handleSave}
              onCancel={() => setIsRenaming(false)}
            />
          ) : (
            <h2 className={`truncate ${editLayout.sectionTitle}`}>{lessonTitle}</h2>
          )}
        </div>

        {!isRenaming && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`${editLayout.iconButton} shrink-0 text-slate-600`}
            aria-label="Ubah nama lesson"
            onClick={() => setIsRenaming(true)}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </header>
  )
}
