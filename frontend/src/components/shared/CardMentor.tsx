import { BookOpen, Users, Star, UserX } from 'lucide-react'
import { AdminPublishStatusLabel } from '@/lib/admin/status-label'
import { formatCourseRatingLabel } from '@/lib/course-detail/course-rating'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { ICourseItem } from '@/lib/types/course'
import { CourseCardProfiles } from './CourseCardProfiles'
import { resolveCourseProfiles } from '@/lib/course-detail/course-profile'
import { CourseLevelLabel } from './CourseLevel'
import { CourseCardCover, CourseCardCoverFrame } from './CourseCardCover'
import type { CourseApiLevel } from '@/lib/types/user'
import { appCourseCardClassName } from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

interface CardMentorProps {
  data: ICourseItem
  onStatusClick?: (uid: string) => void
  detailHref?: string
  /** Opsional: kompatibilitas mundur prop adminStatusLabel */
  adminStatusLabel?: boolean
  className?: string
}

const CardMentor = ({
  data,
  onStatusClick,
  detailHref,
  className,
}: CardMentorProps) => {
  const profiles = resolveCourseProfiles(data)
  const isPublished = isCoursePublished(data)
  const image = data.thumbnail_url || data.cover_url

  return (
    <article
      className={cn(
        appCourseCardClassName,
        'group flex h-full w-full flex-col overflow-hidden',
        className,
      )}
    >
      {/* 1. Course Image Frame */}
      <CourseCardCoverFrame className="relative h-36 sm:h-40 w-full shrink-0 overflow-hidden rounded-none border-b border-line-light aspect-auto">
        <CourseCardCover
          src={image}
          alt={data.title}
          fill
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </CourseCardCoverFrame>

      {/* 2. Content Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <CourseLevelLabel level={data.level as CourseApiLevel} compact />
            <AdminPublishStatusLabel published={isPublished} />
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink-900 transition-colors group-hover:text-ink-950 sm:text-[15px]">
            {data.title}
          </h3>
          <p className="line-clamp-2 text-xs font-normal leading-relaxed text-ink-500">
            {data.description || data.subtitle}
          </p>
        </div>

        {/* 3. Stats and Actions */}
        <div className="mt-auto space-y-2.5 border-t border-line-light pt-2.5">
          <div className="flex items-center gap-2.5 text-xs font-medium text-ink-500">
            <div className="flex items-center gap-1 font-bold text-ink-900">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="tabular-nums">{formatCourseRatingLabel(data.rating)}</span>
            </div>
            <span className="text-line-medium">·</span>
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-ink-400" aria-hidden />
              <span className="tabular-nums">{data.slot ?? 0} Slot</span>
            </div>
            <span className="text-line-medium">·</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-ink-400" aria-hidden />
              <span className="tabular-nums">{data.total_reviews ?? 0} Review</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              {profiles.length > 0 ? (
                <CourseCardProfiles profiles={profiles} compact />
              ) : (
                <div className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-ink-900/10 bg-paper-paper px-2 py-0.5 text-xs font-medium text-ink-500">
                  <UserX className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                  <span className="truncate">Belum ada mentor</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {detailHref && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-sm border-2 border-ink-900/10 bg-paper-white px-3 text-xs font-semibold text-ink-900 shadow-none hover:border-ink-900/30 hover:bg-paper-paper active:scale-[0.98] transition-all"
                >
                  <Link to={detailHref}>Kelola Kursus</Link>
                </Button>
              )}
              {onStatusClick && (
                <Button
                  onClick={() => onStatusClick(data.uid)}
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-sm border-2 border-ink-900/10 bg-paper-white text-ink-500 hover:border-ink-900/30 hover:bg-paper-paper hover:text-ink-900 shadow-none"
                  title="Update Status"
                >
                  <Star className="size-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CardMentor
