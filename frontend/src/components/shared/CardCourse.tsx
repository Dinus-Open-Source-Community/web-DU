import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CourseCardCover, CourseCardCoverFrame } from './CourseCardCover'
import { CourseCardProfiles } from './CourseCardProfiles'
import type { ICardProps } from '../../lib/types/utils'
import { Rating } from '../ui/rating'
import { hasPublishedCourseReviews } from '@/lib/course-detail/course-rating'
import {
  resolveCourseProfiles,
} from '@/lib/course-detail/course-profile'
import { FormatRupiah } from '@/lib/func/func'
import { isLearningProgressComplete } from '@/lib/learning/progress'

type CourseLevelKey = 'PEMULA' | 'MENENGAH' | 'LANJUTAN'

const levelLabel: Record<CourseLevelKey, string> = {
  PEMULA: 'Pemula',
  MENENGAH: 'Menengah',
  LANJUTAN: 'Lanjutan',
}

const levelSignal: Record<CourseLevelKey, { activeBars: number; color: string }> = {
  PEMULA: { activeBars: 1, color: 'bg-emerald-500' },
  MENENGAH: { activeBars: 2, color: 'bg-sky-500' },
  LANJUTAN: { activeBars: 3, color: 'bg-violet-500' },
}

const sizes = {
  container: {
    sm: 'w-full',
    md: 'w-full',
    lg: 'w-full',
  },
  imageWrapper: {
    sm: 'min-h-[160px]',
    md: 'min-h-[203px]',
    lg: 'min-h-[250px]',
  },
  contentWrapper: {
    sm: 'min-h-[160px] p-4 -mt-6',
    md: 'min-h-[208px] p-5 -mt-6',
    lg: 'min-h-[250px] p-6 -mt-8',
  },
  title: {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  },
  description: {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-lg',
  },
}

function normalizeLevel(level?: string): CourseLevelKey | null {
  const normalized = level?.trim().toUpperCase()

  if (normalized === 'PEMULA' || normalized === 'MENENGAH' || normalized === 'LANJUTAN') return normalized
  return null
}

function CourseLevelSignal({ level }: { level?: string }) {
  const normalizedLevel = normalizeLevel(level)
  if (!normalizedLevel) return null

  const signal = levelSignal[normalizedLevel]

  return (
    <span className="inline-flex items-end gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
      <span className="flex h-4 items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={`w-1.5 rounded-full ${bar <= signal.activeBars ? signal.color : 'bg-slate-200'}`} style={{ height: `${bar * 4 + 4}px` }} />
        ))}
      </span>
      {levelLabel[normalizedLevel]}
    </span>
  )
}

const CardCourse = ({
  size = 'md',
  data,
  coverLoading = 'lazy',
  coverFetchPriority,
}: {
  size?: 'sm' | 'md' | 'lg'
  data: ICardProps
  coverLoading?: 'lazy' | 'eager'
  coverFetchPriority?: 'high' | 'low' | 'auto'
}) => {
  const profiles = resolveCourseProfiles(data)
  const isEnrolled =
    data.isEnrolled ?? (data.enrollment_status ? data.enrollment_status === 'active' || data.enrollment_status === 'completed' : data.progress !== undefined)
  const actionLabel = isEnrolled ? 'Mulai' : 'Daftar'
  const showRating = hasPublishedCourseReviews(data.total_reviews)

  return (
    <div className={`flex h-full w-full ${sizes.container[size]} flex-col overflow-hidden drop-shadow-sm transition-all hover:drop-shadow-md duration-300`}>
      {/* Image Content*/}
      <CourseCardCoverFrame className={sizes.imageWrapper[size]}>
        <CourseCardCover
          src={data.cover_url}
          alt={data.title}
          fill
          loading={coverLoading}
          fetchPriority={coverFetchPriority}
        />
      </CourseCardCoverFrame>

      {/* Content description */}
      <div className={`relative z-10 flex grow flex-col rounded-xl bg-white border border-slate-100/50 ${sizes.contentWrapper[size]}`}>
        {/* Top Info */}
        {(data.is_premium || data.level) && (
          <div className="mb-3 flex items-center justify-between">
            {data.is_premium ? <Badge variant="premium" /> : <Badge variant="free" />}
            <CourseLevelSignal level={data.level} />
          </div>
        )}

        <div className="mb-5 flex w-full flex-col gap-1.5">
          <h3 className={`mb-1 line-clamp-2 font-bold leading-tight text-slate-900 ${sizes.title[size]}`}>{data.title}</h3>
          {data.module && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{data.module}</p>}
          <div className="flex flex-col grow">
            {data.description && <p className={`line-clamp-2 text-sm font-normal leading-[1.6] text-slate-500 ${sizes.description[size]}`}>{data.description}</p>}
            {(data.price !== undefined || showRating) && (
              <div className="mt-5 flex items-center justify-between gap-3">
                {data.price !== undefined ? <span className="text-base font-semibold text-primary">{FormatRupiah(data.price)}</span> : <span />}
                {showRating && data.rating !== undefined && data.total_reviews !== undefined ? (
                  <Rating rating={data.rating} totalReviews={data.total_reviews} />
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section (Author & Action) */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          {profiles.length > 0 ? <CourseCardProfiles profiles={profiles} /> : <div />}

          <div className="flex items-center gap-3">
            {data.progress !== undefined && isLearningProgressComplete(data.progress) ? (
              <Badge variant="progressComplete" />
            ) : data.detailHref ? (
              <Button asChild className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
                <Link to={data.detailHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button className="px-5 py-2 text-sm font-semibold rounded-lg shadow-sm" variant="default" size="sm">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCourse
