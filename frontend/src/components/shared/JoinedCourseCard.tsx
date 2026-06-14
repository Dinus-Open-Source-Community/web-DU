import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ReactIcon } from './icon'
import type { JoinedCourse } from '@/lib/types/user'
import { Profile } from '../ui/profile'
import { Check } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import {
  DEFAULT_COURSE_PROFILE_AVATAR,
  resolveCourseProfile,
  resolveCourseProfileAvatar,
} from '@/lib/course-detail/course-profile'
import { CourseLevelSignal } from './CourseLevel'
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
  const profile = resolveCourseProfile(data)

  return (
    <div
      className={`group flex h-full ${sizes.container[size]} flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-slate-300/90 hover:shadow-md`}>
      <div className={`relative aspect-video w-full shrink-0 overflow-hidden rounded-[10px] ${sizes.imageWrapper[size]}`}>
        {image ? (
          <img
            src={image}
            alt={data.title}
            loading="lazy"
            className="h-full w-full rounded-[10px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-slate-950/45 to-transparent" />
      </div>

      <div className={`relative z-10 flex grow flex-col rounded-xl border border-slate-100/70 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.04)] ${sizes.contentWrapper[size]}`}>
        <div className="mb-5 flex flex-col">
          <div className="mb-3 flex items-center justify-between gap-3">
            <CourseLevelSignal level={data.level} />
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden />
              <span className="line-clamp-1">Dapat diakses</span>
            </div>
          </div>
          <h3 className={`mb-2 line-clamp-2 font-bold leading-snug text-slate-900 ${sizes.title[size]}`}>{data.title}</h3>
          <p className={`line-clamp-2 font-normal leading-[1.55] text-slate-500 ${sizes.description[size]}`}>{data.description || data.subtitle}</p>
        </div>

        {showProgress && (
          <div className={`mt-auto mb-5 w-full rounded-xl border border-slate-100 bg-slate-50/70 ${sizes.progress[size]}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">Progres Belajar</span>
              <div className="flex items-center gap-2">
                {isComplete ? <Badge variant="progressComplete" /> : null}
                <span className="text-xs font-bold text-primary tabular-nums">{progressLabel}</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {profile ? (
                <Profile
                  image={resolveCourseProfileAvatar(profile, DEFAULT_COURSE_PROFILE_AVATAR)}
                  name={profile.name}
                />
              ) : null}
            </div>

            <Button
              asChild
              className="h-9 shrink-0 rounded-[10px] px-5 text-sm font-semibold shadow-none"
              variant="default">
              <Link to={ROUTES.student.learningCourse(data.uid)}>{actionLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinedCourseCard
