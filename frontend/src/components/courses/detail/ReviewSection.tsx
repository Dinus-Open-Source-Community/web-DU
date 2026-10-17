import type { CourseDetailReview } from '@/lib/types/course'
import { Star } from 'lucide-react'

import { ReviewLottieIllustration } from '@/components/playful/ReviewLottieIllustration'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function CourseUserReviews({ reviews }: { reviews: CourseDetailReview[] }) {
  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={detailLayout.sectionTitle}>Ulasan</h2>
        <span className={detailLayout.sectionSubtitle}>{reviews.length.toLocaleString('id-ID')} ulasan</span>
      </div>

      {reviews.length > 0 ? (
        <div className="flex flex-col divide-y divide-line-light">
          {reviews.map((review) => (
            <article key={review.uid} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-paper-paper">
                  {review.user.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink-500">
                      {getInitials(review.user.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-semibold text-ink-900">{review.user.name}</h3>
                    <span className={detailLayout.meta}>{formatReviewDate(review.created_at)}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const filled = index + 1 <= Math.round(review.rating)

                      return (
                        <Star
                          key={index}
                          className={filled ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-ink-400'}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <p className={detailLayout.body}>{review.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line-light bg-paper-paper/70 px-4 py-10 text-center">
          <ReviewLottieIllustration className="mb-2 max-w-[12rem]" height="160px" />
          <p className="text-sm font-medium text-ink-600">Belum ada ulasan dari peserta.</p>
        </div>
      )}
    </section>
  )
}

export default CourseUserReviews
