import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

import { Button } from '../ui/button'
import { CourseCardCover, CourseCardCoverFrame } from './CourseCardCover'
import { CourseCardProfiles } from './CourseCardProfiles'
import { CourseLevelLabel } from './CourseLevel'
import { appCourseCardClassName } from '@/lib/design/app-shell-tokens'
import {
  formatLearningProgressLabel,
  isLearningProgressComplete,
  toLearningProgressPercent,
} from '@/lib/learning/progress'
import { resolveCourseProfiles } from '@/lib/course-detail/course-profile'
import { ROUTES } from '@/lib/routes'
import type { JoinedCourse } from '@/lib/types/user'
import { cn } from '@/lib/utils'

export type JoinedCourseCardVariant = 'resume' | 'non-resume'
export type JoinedCourseCardSize = 'sm' | 'md' | 'lg'

interface JoinedCourseCardProps {
  data: JoinedCourse
  variant?: JoinedCourseCardVariant
  size?: JoinedCourseCardSize
  className?: string
}

const sizes = {
  imageWrapper: {
    sm: 'h-36 sm:h-40',
    md: 'h-40 sm:h-44',
    lg: 'h-44 sm:h-48',
  },
  contentWrapper: {
    sm: 'p-3.5 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  },
  title: {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-[17px]',
    lg: 'text-lg sm:text-xl',
  },
  description: {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm',
  },
}

const JoinedCourseCard = ({
  data,
  variant = 'non-resume',
  size = 'md',
  className,
}: JoinedCourseCardProps) => {
  const progress = toLearningProgressPercent(data.progress)
  const progressLabel = formatLearningProgressLabel(data.progress)
  const isComplete =
    isLearningProgressComplete(data.progress) && data.enrollment_status === 'completed'
  const isResume =
    variant === 'resume' || (data.enrollment_status === 'active' && progress > 0)
  const showProgress = isResume || isComplete || progress > 0
  const image = data.cover_url || data.thumbnail_url
  const actionLabel = isComplete ? 'Belajar lagi' : 'Lanjut'
  const profiles = resolveCourseProfiles(data)

  return (
    <div
      className={cn(
        appCourseCardClassName,
        'group flex h-full w-full max-w-full flex-col overflow-hidden',
        className,
      )}
    >
      <CourseCardCoverFrame
        className={cn(
          'relative w-full shrink-0 overflow-hidden rounded-none border-b border-line-light aspect-auto',
          sizes.imageWrapper[size],
        )}
      >
        <CourseCardCover
          src={image}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </CourseCardCoverFrame>

      <div className={cn('flex flex-1 flex-col', sizes.contentWrapper[size])}>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <CourseLevelLabel level={data.level} compact />
          <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <Check className="size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-1">Dapat diakses</span>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-1.5">
          <h3
            className={cn(
              'line-clamp-2 font-bold leading-snug text-ink-900 transition-colors group-hover:text-ink-950',
              sizes.title[size],
            )}
          >
            {data.title}
          </h3>
          <p
            className={cn(
              'line-clamp-2 font-normal leading-relaxed text-ink-500',
              sizes.description[size],
            )}
          >
            {data.description || data.subtitle}
          </p>
        </div>

        {showProgress && (
          <div className="mt-auto mb-4 w-full rounded-lg border border-line-light bg-paper-paper p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-600">Progres Belajar</span>
              <span className="text-xs font-bold tabular-nums text-ink-900">{progressLabel}</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progres belajar ${progressLabel}`}
              className="h-2 w-full overflow-hidden rounded-full border border-ink-900/10 bg-paper-white"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isComplete ? 'bg-emerald-500' : 'bg-brand-blue',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-line-light pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {profiles.length > 0 ? (
                <CourseCardProfiles profiles={profiles} compact />
              ) : (
                <div className="text-xs font-medium text-ink-400">Doscom University</div>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className="h-8 shrink-0 rounded-sm border-2 border-ink-900/10 bg-primary px-3.5 text-xs font-semibold !text-white shadow-none hover:bg-brand-hover active:scale-[0.98] transition-all"
            >
              <Link to={ROUTES.student.learningCourse(data.uid)} className="!text-white font-semibold">
                {actionLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinedCourseCard
