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
import { isLearningProgressComplete } from '@/lib/learning/progress'
import { CourseLevelLabel } from './CourseLevel'

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
        {data.level && (
          <div className="mb-3 flex items-center justify-end">
            <CourseLevelLabel level={data.level} />
          </div>
        )}

        <div className="mb-5 flex w-full flex-col gap-1.5">
          <h3 className={`mb-1 line-clamp-2 font-bold leading-tight text-slate-900 ${sizes.title[size]}`}>{data.title}</h3>
          {data.module && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{data.module}</p>}
          <div className="flex flex-col grow">
            {data.description && <p className={`line-clamp-2 text-sm font-normal leading-[1.6] text-slate-500 ${sizes.description[size]}`}>{data.description}</p>}
            {showRating && data.rating !== undefined && data.total_reviews !== undefined && (
              <div className="mt-5 flex items-center justify-end gap-3">
                <Rating rating={data.rating} totalReviews={data.total_reviews} />
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
              <Button asChild className="px-5 py-2 text-sm font-semibold rounded-sm shadow-sm" variant="default" size="sm">
                <Link to={data.detailHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button className="px-5 py-2 text-sm font-semibold rounded-sm shadow-sm" variant="default" size="sm">
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
