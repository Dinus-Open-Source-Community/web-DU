import { Eye, MoreHorizontal, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailMobileActionsProps = {
  previewHref: string
  isAdmin: boolean
  isPublished: boolean
  onEditClick: () => void
  onPublishClick: () => void
  onDeleteClick?: () => void
}

export function CourseDetailMobileActions({
  previewHref,
  isAdmin,
  isPublished,
  onEditClick,
  onPublishClick,
  onDeleteClick,
}: CourseDetailMobileActionsProps) {
  return (
    <div className={manageDetailLayout.stickyBar}>
      <div className={manageDetailLayout.stickyBarInner}>
        <div
          className={cn(
            'grid gap-2',
            isAdmin ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-1',
          )}
        >
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              className={cn(manageDetailLayout.actionButton, 'w-full px-3')}
              onClick={onEditClick}
            >
              <Pencil className="mr-1.5 size-4 opacity-70" aria-hidden />
              Edit kursus
            </Button>
          ) : null}

          <Button asChild variant="outline" className={cn(manageDetailLayout.actionButton, 'w-full px-3')}>
            <Link to={previewHref} target="_blank" rel="noreferrer">
              <Eye className="mr-1.5 size-4 opacity-70" aria-hidden />
              Pratinjau
            </Link>
          </Button>

          {isAdmin && (!isPublished || onDeleteClick) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(manageDetailLayout.actionButton, 'px-3')}
                  aria-label="Aksi admin lainnya"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {!isPublished ? (
                  <DropdownMenuItem onClick={onPublishClick}>
                    <Sparkles className="size-4" aria-hidden />
                    Terbit
                  </DropdownMenuItem>
                ) : null}
                {onDeleteClick ? (
                  <DropdownMenuItem
                    onClick={onDeleteClick}
                    className="text-rose-600 focus:text-rose-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Hapus kursus
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </div>
  )
}
