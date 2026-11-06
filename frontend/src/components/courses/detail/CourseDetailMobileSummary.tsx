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
        'flex items-stretch gap-3.5 p-3.5 sm:gap-4 sm:p-4 lg:hidden',
        className,
      )}
    >
      <CourseCardCoverCompactFrame className="w-28 shrink-0 overflow-hidden rounded-xl border-2 border-ink-900 sm:w-36">
        <CourseCardCover
          src={previewImage}
          alt="Pratinjau kursus"
          fill
          className="rounded-lg"
          imgClassName="rounded-lg"
        />
      </CourseCardCoverCompactFrame>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {hasPublishedCourseReviews(totalReviews) ? (
          <div className="flex items-center gap-1.5 text-xs text-ink-700 sm:text-sm">
            <Star className="size-3.5 fill-note-yellow text-ink-900" aria-hidden />
            <span className="font-mono font-bold text-ink-900">{rating.toFixed(1)}</span>
            <span className="font-mono text-ink-500">
              ({totalReviews.toLocaleString('id-ID')} ulasan)
            </span>
          </div>
        ) : (
          <p className="font-mono text-xs font-semibold text-ink-500">Belum ada ulasan</p>
        )}
      </div>
    </section>
  )
}
