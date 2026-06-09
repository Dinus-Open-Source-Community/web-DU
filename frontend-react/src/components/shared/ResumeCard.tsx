import { ReactIcon } from './icon'
import { Badge } from '../ui/badge'
import { Rating } from '../ui/rating'
import { Profile } from '../ui/profile'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import {
  DEFAULT_COURSE_PROFILE_AVATAR,
  resolveCourseProfile,
  resolveCourseProfileAvatar,
  type CourseProfileSource,
} from '@/lib/course-detail/course-profile'
import type { BadgeVariant } from '@/lib/types/course'
import { isProgressComplete, progressToPercent } from '@/lib/progress'

interface IResumeCardProps {
  title: string
  description?: string
  progress?: number
  image?: string
  module?: string
  author?: {
    name?: string
    avatar?: string
  }
  variantBadge?: BadgeVariant
  rating?: number
  totalReviews?: number
  resumeDetailHref?: string
}

const ResumeCard = ({ data }: { data: IResumeCardProps & CourseProfileSource }) => {
  const progressPercent = data.progress === undefined ? undefined : progressToPercent(data.progress)
  const profile =
    resolveCourseProfile(data) ??
    (data.author?.name
      ? { name: data.author.name, avatar_url: data.author.avatar }
      : null)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white transition-colors hover:border-slate-300/90">
      {/* Image Content */}
      <div className="relative aspect-video w-full shrink-0 rounded-[10px] min-h-[203px]">
        {data.image ? (
          <img src={data.image} alt={data.title} loading="lazy" className="rounded-[10px] object-cover" sizes="(max-width: 768px) 100vw, 384px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#D2E1ED] text-[#00D8FF]">
            <ReactIcon />
          </div>
        )}
      </div>

      {/* Content description */}
      <div className="relative z-10 -mt-6 flex grow flex-col rounded-xl bg-white p-5">
        {/* Top Info (Badge & Rating) */}
        {(data.variantBadge || data.rating !== undefined) && (
          <div className="mb-3 flex items-center justify-between">
            {data.variantBadge && <Badge variant={data.variantBadge} />}
            {data.rating !== undefined && data.totalReviews !== undefined && <Rating rating={data.rating} totalReviews={data.totalReviews} />}
          </div>
        )}

        <div className="mb-4 flex flex-col">
          <h3 className="mb-1 line-clamp-2 text-lg font-bold leading-snug text-slate-900">{data.title}</h3>
          {data.module && <p className="mb-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">{data.module}</p>}

          {data.description && <p className="line-clamp-2 text-sm leading-[1.4] font-normal text-slate-500">{data.description}</p>}
        </div>

        {/* Progress */}
        {progressPercent !== undefined && (
          <div className="mt-auto mb-5 w-full">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Progres Belajar</span>
              <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Bottom Section (Author & Action) */}
        {profile && (
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <Profile
              image={resolveCourseProfileAvatar(profile, DEFAULT_COURSE_PROFILE_AVATAR)}
              name={profile.name}
            />
            {data.progress !== undefined && isProgressComplete(data.progress) ? (
              <Badge variant="progressComplete" />
            ) : data.resumeDetailHref ? (
              <Button asChild className="px-5 py-2 text-sm font-semibold rounded-lg shadow-none" variant="default" size="sm">
                <Link to={data.resumeDetailHref}>Lanjut</Link>
              </Button>
            ) : (
              <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-none" variant="default" size="sm">
                Lanjut
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeCard
