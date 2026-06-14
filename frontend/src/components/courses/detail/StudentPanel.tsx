import { Star } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import type { ICourseDetailItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

export interface FeedbackBreakdown {
  stars: number
  percent: number
}

interface StudentFeedbackPanelProps {
  course: ICourseDetailItem
}

function getFeedbackBreakdown(course: ICourseDetailItem): FeedbackBreakdown[] {
  const totalReviews = course.total_reviews || course.reviews.length

  return [5, 4, 3, 2, 1].map((stars) => {
    const reviewCount = course.reviews.filter((review) => Math.round(review.rating) === stars).length
    const percent = totalReviews > 0 ? Math.round((reviewCount / totalReviews) * 100) : 0

    return { stars, percent }
  })
}

export function StudentFeedbackPanel({ course }: StudentFeedbackPanelProps) {
  const rating = course.rating
  const totalReviews = course.total_reviews || course.reviews.length
  const breakdown = getFeedbackBreakdown(course)

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
      <h2 className={cn(detailLayout.sectionTitle, 'mb-4')}>Ulasan peserta</h2>
      <div className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start">
        <div className="flex flex-col items-center justify-center gap-1 sm:items-start">
          <span className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{rating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, index) => {
              const filled = index + 1 <= Math.round(rating)
              return (
                <Star
                  key={index}
                  className={cn('h-4 w-4', filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
                />
              )
            })}
          </div>
          <p className={detailLayout.meta}>{totalReviews.toLocaleString('id-ID')} ulasan</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-2.5 text-sm sm:gap-3">
              <span className="inline-flex w-12 shrink-0 items-center gap-1 text-slate-600 sm:w-14">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                <span className="font-medium">{row.stars}</span>
              </span>
              <Progress value={row.percent} className="h-2 min-w-0 flex-1" />
              <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-500 tabular-nums sm:w-10">
                {row.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
