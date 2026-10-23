import { Star } from 'lucide-react'

import {
  CourseCardCover,
  CourseCardCoverCompactFrame,
} from '@/components/shared/CourseCardCover'
import { hasPublishedCourseReviews } from '@/lib/course-detail/course-rating'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailMobileSummaryProps = {
  previewImage?: string
  rating: number
  totalReviews: number
  className?: string
}

export function CourseDetailMobileSummary({
  previewImage,
  rating,
  totalReviews,
  className,
}: CourseDetailMobileSummaryProps) {
  return (
    <section
      className={cn(
        detailLayout.sectionCard,
        'flex items-stretch gap-3 p-3 sm:gap-4 sm:p-4 lg:hidden',
        className,
      )}
    >
      <CourseCardCoverCompactFrame className="w-28 rounded-xl sm:w-36">
        <CourseCardCover
          src={previewImage}
          alt="Pratinjau kursus"
          fill
          className="rounded-xl"
          imgClassName="rounded-xl"
        />
      </CourseCardCoverCompactFrame>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {hasPublishedCourseReviews(totalReviews) ? (
          <div className="flex items-center gap-1.5 text-xs text-ink-500 sm:text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold text-ink-700">{rating.toFixed(1)}</span>
            <span>({totalReviews.toLocaleString('id-ID')} ulasan)</span>
          </div>
        ) : (
          <p className="text-xs text-ink-500 sm:text-sm">Belum ada ulasan</p>
        )}
      </div>
    </section>
  )
}
