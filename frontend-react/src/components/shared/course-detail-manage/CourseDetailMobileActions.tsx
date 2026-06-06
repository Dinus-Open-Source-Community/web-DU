import { Eye, Layers3, Pencil, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailMobileActionsProps = {
  curriculumEditHref: string
  curriculumEditNavigationState?: unknown
  previewHref: string
  isAdmin: boolean
  isPublished: boolean
  onEditClick: () => void
  onPublishClick: () => void
}

export function CourseDetailMobileActions({
  curriculumEditHref,
  curriculumEditNavigationState,
  previewHref,
  isAdmin,
  isPublished,
  onEditClick,
  onPublishClick,
}: CourseDetailMobileActionsProps) {
  return (
    <div className={manageDetailLayout.stickyBar}>
      <div className={manageDetailLayout.stickyBarInner}>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className={cn(manageDetailLayout.actionButton, 'flex-1')}
            onClick={onEditClick}
          >
            <Pencil className="mr-2 size-4 opacity-70" aria-hidden />
            Edit kursus
          </Button>

          <Button asChild variant="outline" className={cn(manageDetailLayout.actionButton, 'flex-1')}>
            <Link to={previewHref} target="_blank">
              <Eye className="mr-2 size-4 opacity-70" aria-hidden />
              Pratinjau
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            asChild
            className={cn(
              manageDetailLayout.actionButton,
              isAdmin ? 'flex-1' : 'w-full',
              'bg-primary text-white hover:bg-primary/90',
            )}
          >
            <Link to={curriculumEditHref} state={curriculumEditNavigationState}>
              <Layers3 className="mr-2 size-4" aria-hidden />
              Edit kurikulum
            </Link>
          </Button>

          {isAdmin ? (
            <Button
              type="button"
              onClick={onPublishClick}
              className={cn(
                manageDetailLayout.actionButton,
                'flex-1',
                isPublished
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-slate-900 text-white hover:bg-slate-800',
              )}
            >
              <Sparkles className="mr-2 size-4" aria-hidden />
              {isPublished ? 'Update status' : 'Terbitkan'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
