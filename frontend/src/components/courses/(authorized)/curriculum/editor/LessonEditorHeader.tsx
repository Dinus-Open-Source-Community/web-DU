import { useEffect, useState } from 'react'
import { ClipboardList, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CourseEditorTab } from '@/lib/course-edit/types'
import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'
import { editMotion } from '@/lib/course-edit/edit-motion'
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
    <header className={`space-y-4 pb-4 sm:pb-5 ${editLayout.divider}`}>
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

      <Tabs
        value={editorTab}
        onValueChange={(value) => onEditorTabChange(value as CourseEditorTab)}
        className="gap-0"
      >
        <TabsList variant="line" className="h-10 w-full bg-transparent p-0 sm:h-9 sm:w-auto">
          <TabsTrigger
            value="content"
            className="flex-1 px-0 text-sm font-medium transition-colors duration-200 sm:flex-none"
          >
            Konten
          </TabsTrigger>
          <TabsTrigger
            value="homework"
            className="ml-0 flex-1 gap-1.5 px-0 text-sm font-medium transition-colors duration-200 sm:ml-6 sm:flex-none"
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
  )
}
