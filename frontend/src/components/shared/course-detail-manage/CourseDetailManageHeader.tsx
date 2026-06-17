import { Eye, Layers3, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CourseLevelSignal } from '@/components/shared/CourseLevel'
import type { CourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { ICourseDetailItem } from '@/lib/types/course'
import type { JoinedCourse } from '@/lib/types/user'
import { cn } from '@/lib/utils'

type CourseDetailManageHeaderProps = {
  course: ICourseDetailItem
  curriculumEditHref: string
  curriculumEditNavigationState?: CourseEditNavigationState
  previewHref: string
  isAdmin: boolean
  isPublished: boolean
  onEditClick: () => void
  onPublishClick: () => void
  onDeleteClick?: () => void
}

export function CourseDetailManageHeader({
  course,
  curriculumEditHref,
  curriculumEditNavigationState,
  previewHref,
  isAdmin,
  isPublished,
  onEditClick,
  onPublishClick,
  onDeleteClick,
}: CourseDetailManageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant={isPublished ? 'coursePublished' : 'courseDraft'}
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
          >
            {isPublished ? 'Terbit' : 'Draft'}
          </Badge>
          <CourseLevelSignal level={course.level as JoinedCourse['level']} />
        </div>

        <div className="space-y-2">
          <h1 className={manageDetailLayout.pageTitle}>{course.title}</h1>
          {course.subtitle ? (
            <p className={manageDetailLayout.pageSubtitle}>{course.subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <HeaderActionButtons
          curriculumEditHref={curriculumEditHref}
          curriculumEditNavigationState={curriculumEditNavigationState}
          previewHref={previewHref}
          isAdmin={isAdmin}
          isPublished={isPublished}
          onEditClick={onEditClick}
          onPublishClick={onPublishClick}
          onDeleteClick={onDeleteClick}
        />
      </div>
    </section>
  )
}

type HeaderActionButtonsProps = {
  curriculumEditHref: string
  curriculumEditNavigationState?: CourseEditNavigationState
  previewHref: string
  isAdmin: boolean
  isPublished: boolean
  onEditClick: () => void
  onPublishClick: () => void
  onDeleteClick?: () => void
  compact?: boolean
}

export function HeaderActionButtons({
  curriculumEditHref,
  curriculumEditNavigationState,
  previewHref,
  isAdmin,
  isPublished,
  onEditClick,
  onPublishClick,
  onDeleteClick,
  compact = false,
}: HeaderActionButtonsProps) {
  return (
    <>
      {isAdmin ? (
        <Button
          type="button"
          variant="outline"
          className={cn(manageDetailLayout.actionButton, compact && 'flex-1')}
          onClick={onEditClick}
        >
          <Pencil className="mr-2 size-4 opacity-70" aria-hidden />
          Edit kursus
        </Button>
      ) : null}

      <Button
        asChild
        variant="outline"
        className={cn(manageDetailLayout.actionButton, compact && 'flex-1')}
      >
        <Link to={previewHref} target="_blank">
          <Eye className="mr-2 size-4 opacity-70" aria-hidden />
          Pratinjau
        </Link>
      </Button>

      <Button
        asChild
        className={cn(
          manageDetailLayout.actionButton,
          compact ? 'w-full' : 'px-6',
          'bg-primary text-white hover:bg-primary/90',
        )}
      >
        <Link to={curriculumEditHref} state={curriculumEditNavigationState}>
          <Layers3 className="mr-2 size-4" aria-hidden />
          Edit kurikulum
        </Link>
      </Button>

      {isAdmin ? (
        <>
          {!isPublished ? (
            <Button
              type="button"
              onClick={onPublishClick}
              className={cn(
                manageDetailLayout.actionButton,
                compact ? 'w-full' : 'px-6',
                'bg-slate-900 text-white hover:bg-slate-800',
              )}
            >
              <Sparkles className="mr-2 size-4" aria-hidden />
              Terbit
            </Button>
          ) : null}

          {onDeleteClick ? (
            <Button
              type="button"
              variant="outline"
              onClick={onDeleteClick}
              className={cn(
                manageDetailLayout.actionButton,
                compact ? 'w-full' : 'px-6',
                'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700',
              )}
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              Hapus kursus
            </Button>
          ) : null}
        </>
      ) : null}
    </>
  )
}
