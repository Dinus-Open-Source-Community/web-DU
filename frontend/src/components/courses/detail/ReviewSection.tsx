import { Star } from 'lucide-react'

import { ReviewLottieIllustration } from '@/components/playful/ReviewLottieIllustration'
import { StickerTape } from '@/components/playful/Stickers'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import type { CourseDetailReview } from '@/lib/types/course'
import { cn } from '@/lib/utils'

export interface FeedbackBreakdown {
  stars: number
  percent: number
  count: number
}

interface CourseUnifiedReviewHubProps {
  rating: number
  totalReviews: number
  reviews: CourseDetailReview[]
  className?: string
}

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

function getFeedbackBreakdown(reviews: CourseDetailReview[], total: number): FeedbackBreakdown[] {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Math.round(review.rating) === stars).length
    const percent = total > 0 ? Math.round((count / total) * 100) : 0
    return { stars, percent, count }
  })
}

export function CourseUnifiedReviewHub({
  rating,
  totalReviews,
  reviews = [],
  className,
}: CourseUnifiedReviewHubProps) {
  const count = totalReviews || reviews.length
  const breakdown = getFeedbackBreakdown(reviews, count)

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding, className)}>
      <StickerTape className="absolute -top-2.5 right-6 -rotate-2" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-dashed border-ink-900/15 pb-4">
        <div>
          <h2 className={detailLayout.sectionTitle}>Penilaian & Ulasan Peserta</h2>
          <p className="mt-1 font-mono text-xs font-bold text-ink-500">
            {count.toLocaleString('id-ID')} Ulasan dari Siswa
          </p>
        </div>
      </div>

      {/* Top Section: Score + Breakdown */}
      <div className="grid gap-6 sm:grid-cols-[minmax(0,12rem)_1fr] sm:items-center">
        {/* Big Score Box */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-ink-900 bg-paper-panel/50 p-4 text-center sm:p-6 shadow-2xs">
          <span className="font-display text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">
            {rating.toFixed(1)}
          </span>
          <div className="mt-2 flex items-center gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, index) => {
              const filled = index + 1 <= Math.round(rating)
              return (
                <Star
                  key={index}
                  className={cn(
                    'size-4',
                    filled ? 'fill-note-yellow text-ink-900' : 'text-ink-300',
                  )}
                />
              )
            })}
          </div>
          <span className="mt-2 font-mono text-xs font-bold text-ink-600">
            Skor Kursus
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex flex-col gap-2.5">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-2.5 text-sm sm:gap-3">
              <span className="inline-flex w-12 shrink-0 items-center gap-1 text-ink-900 sm:w-14">
                <Star className="size-3.5 fill-note-yellow text-ink-900" aria-hidden />
                <span className="font-mono text-xs font-bold">{row.stars}</span>
              </span>
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-ink-900 bg-paper-panel">
                <div
                  className="h-full bg-note-yellow transition-all duration-300"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-ink-700 tabular-nums">
                {row.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 border-t-2 border-dashed border-ink-900/15" />

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="flex flex-col divide-y-2 divide-dashed divide-ink-900/15">
          {reviews.map((review) => (
            <article key={review.uid} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3.5">
                <div className="size-11 shrink-0 overflow-hidden rounded-full border-2 border-ink-900 bg-note-peach shadow-2xs">
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-ink-900">
                      {getInitials(review.user?.name ?? 'User')}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-display font-bold text-ink-900">{review.user?.name}</h3>
                    <span className={detailLayout.meta}>{formatReviewDate(review.created_at)}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const filled = index + 1 <= Math.round(review.rating)
                      return (
                        <Star
                          key={index}
                          className={cn(
                            'size-3.5',
                            filled ? 'fill-note-yellow text-ink-900' : 'text-ink-300',
                          )}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <p className={detailLayout.body}>{review.comment}</p>

              {/* Mentor Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-2 flex flex-col gap-2.5 rounded-xl border-2 border-ink-900/20 bg-paper-panel/50 p-3.5 sm:ml-12 sm:p-4">
                  {review.replies.map((reply) => (
                    <div key={reply.uid} className="flex items-start gap-3">
                      <div className="size-7 shrink-0 overflow-hidden rounded-full border border-ink-900/40 bg-note-yellow">
                        {reply.replier?.avatar_url ? (
                          <img
                            src={reply.replier.avatar_url}
                            alt={reply.replier.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center font-mono text-[10px] font-bold text-ink-900">
                            M
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs font-bold text-ink-900">
                            {reply.replier?.name ?? 'Mentor'}
                          </span>
                          <span className="rounded bg-note-mint px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-900">
                            Instruktur
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-700">{reply.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-ink-900/20 bg-paper-panel/40 px-4 py-10 text-center">
          <ReviewLottieIllustration className="mb-2 max-w-[12rem]" height="160px" />
          <p className="font-mono text-xs font-bold text-ink-600">Belum ada ulasan dari peserta.</p>
        </div>
      )}
    </section>
  )
}

export default CourseUnifiedReviewHub
