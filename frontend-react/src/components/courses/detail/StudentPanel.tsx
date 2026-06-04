import { Star } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Student Feedback</h2>
      <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-start">
        <div className="flex flex-col items-center justify-center gap-1 sm:items-start">
          <span className="text-5xl font-bold tracking-tight text-slate-900">{rating.toFixed(1)}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i + 1 <= Math.round(rating)
              return <Star key={i} className={cn('h-4 w-4', filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
            })}
          </div>
          <p className="text-xs text-slate-500">{totalReviews.toLocaleString('id-ID')} reviews</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm">
              <span className="inline-flex w-14 shrink-0 items-center gap-1 text-slate-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{row.stars}</span>
              </span>
              <Progress value={row.percent} className="h-2 flex-1" />
              <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-500 tabular-nums">{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
