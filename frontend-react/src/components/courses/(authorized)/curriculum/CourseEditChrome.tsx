import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ICourseDetailItem } from '@/lib/types/course'

import { editLayout } from './edit-layout'

type CourseEditToolbarProps = {
  course: Partial<ICourseDetailItem>
  isAdmin: boolean
  isSaving: boolean
  modifiedCount: number
  onPublish: () => void
  onSave: () => void
}

export function CourseEditToolbar({
  course,
  isAdmin,
  isSaving,
  modifiedCount,
  onPublish,
  onSave,
}: CourseEditToolbarProps) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${editLayout.divider} pb-5`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={editLayout.pageTitle}>{course.title}</h1>
          <Badge
            variant={course.is_published ? 'coursePublished' : 'courseDraft'}
            className="shrink-0"
          />
        </div>
        {course.subtitle && (
          <p className={`truncate ${editLayout.body}`}>{course.subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {modifiedCount > 0 && (
          <span className="text-sm font-medium text-amber-700">
            {modifiedCount} belum disimpan
          </span>
        )}

        <Button
          type="button"
          size="sm"
          className={editLayout.control}
          disabled={isSaving}
          onClick={onSave}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>

        {!course.is_published && isAdmin && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={editLayout.control}
            disabled={isSaving}
            onClick={onPublish}
          >
            Publish
          </Button>
        )}
      </div>
    </header>
  )
}
