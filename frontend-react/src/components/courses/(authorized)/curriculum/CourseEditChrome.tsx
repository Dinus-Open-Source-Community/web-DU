import { ChevronLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CompactPane } from '@/lib/course-edit/viewport'
import type { ICourseDetailItem } from '@/lib/types/course'

import { editLayout } from './edit-layout'

type CourseEditToolbarProps = {
  course: Partial<ICourseDetailItem>
  isAdmin: boolean
  isSaving: boolean
  isPublishing: boolean
  hasUnsavedLesson: boolean
  isCompact: boolean
  compactPane: CompactPane
  onBack: () => void
  onPublish: () => void
  onSave: () => void
}

export function CourseEditToolbar({
  course,
  isAdmin,
  isSaving,
  isPublishing,
  hasUnsavedLesson,
  isCompact,
  compactPane,
  onBack,
  onPublish,
  onSave,
}: CourseEditToolbarProps) {
  const hideActionsOnCompactEditor = isCompact && compactPane === 'editor'

  return (
    <header
      className={`flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between ${editLayout.divider} pb-4 sm:pb-5`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-ml-2 size-9 shrink-0 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            onClick={onBack}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <h1 className={editLayout.pageTitle}>{course.title}</h1>
          <Badge
            variant={course.is_published ? 'coursePublished' : 'courseDraft'}
            className="shrink-0"
          />
        </div>
        {course.subtitle && (
          <p className={`line-clamp-2 sm:truncate ${editLayout.body}`}>{course.subtitle}</p>
        )}
        {isCompact && compactPane === 'outline' && (
          <p className={`pt-1 ${editLayout.body}`}>
            Pilih modul dan lesson untuk mulai mengedit konten kursus.
          </p>
        )}
      </div>

      {!hideActionsOnCompactEditor && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          {hasUnsavedLesson && (
            <span className="w-full text-sm font-medium text-amber-700 sm:w-auto">
              Lesson ini belum disimpan
            </span>
          )}

          <Button
            type="button"
            size="sm"
            className={`${editLayout.control} w-full sm:w-auto`}
            disabled={isSaving || !hasUnsavedLesson}
            onClick={onSave}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan lesson'}
          </Button>

          {!course.is_published && isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${editLayout.control} w-full sm:w-auto`}
              disabled={isSaving || isPublishing}
              onClick={onPublish}
            >
              {isPublishing ? 'Menerbitkan...' : 'Terbitkan'}
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
