import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { CourseCardCover, CourseCardCoverFrame } from './CourseCardCover'
import { CourseCardProfiles } from './CourseCardProfiles'
import type { JoinedCourse } from '@/lib/types/user'
import { Check } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import {
  resolveCourseProfiles,
} from '@/lib/course-detail/course-profile'
import { CourseLevelLabel } from './CourseLevel'
import {
  formatLearningProgressLabel,
  isLearningProgressComplete,
  toLearningProgressPercent,
} from '@/lib/learning/progress'

export type JoinedCourseCardVariant = 'resume' | 'non-resume'
export type JoinedCourseCardSize = 'sm' | 'md' | 'lg'

interface JoinedCourseCardProps {
  data: JoinedCourse
  variant?: JoinedCourseCardVariant
  size?: JoinedCourseCardSize
}

const sizes = {
  container: {
    sm: 'w-full max-w-full',
    md: 'w-full max-w-full',
    lg: 'w-full max-w-full',
  },
  imageWrapper: {
    sm: 'min-h-[160px]',
    md: 'min-h-[203px]',
    lg: 'min-h-[250px]',
  },
  contentWrapper: {
    sm: 'min-h-[160px] p-4 -mt-5',
    md: 'min-h-[208px] p-5 -mt-5',
    lg: 'min-h-[250px] p-6 -mt-6',
  },
  title: {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  },
  description: {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  },
  progress: {
    sm: 'px-3 py-2.5',
    md: 'px-4 py-3',
    lg: 'px-4 py-3',
  },
}

const JoinedCourseCard = ({ data, variant = 'non-resume', size = 'md' }: JoinedCourseCardProps) => {
  const progress = toLearningProgressPercent(data.progress)
  const progressLabel = formatLearningProgressLabel(data.progress)
  const isComplete = isLearningProgressComplete(data.progress)
  const isResume = variant === 'resume'
  const showProgress = isResume || isComplete
  const image = data.cover_url || data.thumbnail_url
  const actionLabel = isComplete ? 'Belajar lagi' : isResume ? 'Lanjut' : 'Mulai'
  const profiles = resolveCourseProfiles(data)

  return (
    <div
      className={`group flex h-full ${sizes.container[size]} flex-col overflow-hidden rounded-[10px] border border-ink-900/10 bg-paper-white shadow-sm transition-all duration-300 hover:border-line-medium/90 hover:shadow-md`}>
      <CourseCardCoverFrame className={sizes.imageWrapper[size]}>
        <CourseCardCover
          src={image}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 100vw, 384px"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-ink-900/45 to-transparent" />
      </CourseCardCoverFrame>

      <div className={`relative z-10 flex grow flex-col rounded-xl border border-line-light/70 bg-paper-white shadow-[0_-8px_24px_rgba(15,23,42,0.04)] ${sizes.contentWrapper[size]}`}>
        <div className="mb-5 flex flex-col">
          <div className="mb-3 flex items-center justify-between gap-3">
            <CourseLevelLabel level={data.level} />
            <div className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">Dapat diakses</span>
            </div>
          </div>
          <h3 className={`mb-2 line-clamp-2 font-bold leading-snug text-ink-900 ${sizes.title[size]}`}>{data.title}</h3>
          <p className={`line-clamp-2 font-normal leading-[1.55] text-ink-500 ${sizes.description[size]}`}>{data.description || data.subtitle}</p>
        </div>

        {showProgress && (
          <div className={`mt-auto mb-5 w-full rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper ${sizes.progress[size]}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-500">Progres Belajar</span>
              <span className="text-xs font-bold tabular-nums text-ink-900">{progressLabel}</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progres belajar ${progressLabel}`}
              className="h-2 w-full overflow-hidden rounded-full border border-ink-900/10 bg-paper-paper"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${isComplete ? 'bg-emerald-500' : 'bg-brand-blue'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-line-light pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {profiles.length > 0 ? <CourseCardProfiles profiles={profiles} compact /> : null}
            </div>

            <Button
              asChild
              variant="outline"
              className="h-8 shrink-0 rounded-sm border-2 border-ink-900/10 bg-paper-white px-3.5 text-xs font-semibold text-ink-900 shadow-none hover:border-ink-900/30 hover:bg-paper-paper active:scale-[0.98] transition-all"
            >
              <Link to={ROUTES.student.learningCourse(data.uid)}>{actionLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinedCourseCard
