import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { MessageSquareText, Reply, Send, Star, UserRound } from 'lucide-react'
import type { CourseDetailReview } from '@/lib/types/course'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface CourseReviewSectionProps {
  reviews: CourseDetailReview[]
  isAdmin?: boolean
  onReply?: (reviewUid: string, comment: string) => void
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return format(date, 'd MMM yyyy', { locale: id })
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function ratingBarColor(stars: number) {
  if (stars >= 4) return 'bg-teal-500'
  if (stars === 3) return 'bg-amber-400'
  if (stars === 2) return 'bg-sky-500'
  return 'bg-rose-500'
}

function ReviewStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating || 0)))

  return (
    <div className="flex items-center gap-0.5" aria-label={`${normalizedRating} dari 5 bintang`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn(size === 'md' ? 'size-4' : 'size-3.5', index < normalizedRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200')} />
      ))}
    </div>
  )
}

export function CourseReviewSection({ reviews, isAdmin, onReply }: CourseReviewSectionProps) {
  const totalReplies = useMemo(() => reviews.reduce((total, review) => total + (review.replies?.length ?? 0), 0), [reviews])
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((total, review) => total + (review.rating || 0), 0) / reviews.length
  }, [reviews])
  const ratingDistribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.round(review.rating || 0) === stars).length,
    }))
    const maxCount = Math.max(...counts.map((item) => item.count), 1)

    return counts.map((item) => ({
      ...item,
      percent: Math.round((item.count / maxCount) * 100),
    }))
  }, [reviews])

  return (
    <section className="w-full">
      <section className="border-b border-slate-100 pb-6">
        <div className="grid gap-0 overflow-hidden rounded-xl bg-white  lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.12fr)]">
          <div className="border-b border-slate-100 px-1 py-4 sm:px-4  lg:border-b-0 lg:border-r lg:px-6">
            <p className="text-[13px] font-semibold leading-5 text-slate-700">Total Reviews</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-[32px] font-semibold leading-none tabular-nums text-slate-950">{formatCompactNumber(reviews.length)}</p>
              {totalReplies > 0 ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold leading-5 text-emerald-700">{formatCompactNumber(totalReplies)} replies</span>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Reviews submitted for this course</p>
          </div>

          <div className="border-b border-slate-100 px-1 py-4 sm:px-4 lg:border-b-0 lg:border-r lg:px-6">
            <p className="text-[13px] font-semibold leading-5 text-slate-700">Average Rating</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-[32px] font-semibold leading-none tabular-nums text-slate-950">{averageRating.toFixed(1)}</p>
              <ReviewStars rating={averageRating} size="md" />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Average rating from course reviews</p>
          </div>

          <div className="px-1 py-3 sm:px-4 lg:px-6">
            <div className="space-y-1.5">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="grid grid-cols-[16px_minmax(0,1fr)_44px] items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-slate-500">{item.stars}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label={`${item.count} review dengan rating ${item.stars}`}>
                    <div className={cn('h-full rounded-full', ratingBarColor(item.stars))} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-right text-xs font-medium tabular-nums text-slate-500">{formatCompactNumber(item.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <MessageSquareText className="size-4 text-slate-500" />
            Diskusi & ulasan
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">Pantau pengalaman peserta dan balas review secara langsung.</p>
        </div>
      </section>

      {reviews.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-400">
              <MessageSquareText className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Belum ada review</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">Review dan balasan akan muncul setelah peserta mengirim ulasan.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {reviews.map((review) => (
            <ReviewItem key={review.uid} review={review} isAdmin={isAdmin} onReply={onReply} />
          ))}
        </div>
      )}
    </section>
  )
}

function ReviewItem({ review, isAdmin, onReply }: { review: CourseDetailReview; isAdmin?: boolean; onReply?: (uid: string, comment: string) => void }) {
  const [replyText, setReplyText] = useState('')
  const canReply = Boolean(onReply)
  const rating = Number.isFinite(review.rating) ? review.rating : 0
  const replies = review.replies ?? []

  const handleSendReply = () => {
    const comment = replyText.trim()
    if (!comment) return
    onReply?.(review.uid, comment)
    setReplyText('')
  }

  return (
    <article className="py-5 sm:py-6">
      <div className="flex gap-3 sm:gap-4">
        <Avatar className="size-10">
          <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
          <AvatarFallback className="bg-slate-100 text-slate-500">
            <UserRound className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold leading-5 text-slate-950">{review.user.name}</h3>
                <span className="text-xs leading-5 text-slate-500">{formatReviewDate(review.created_at)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ReviewStars rating={rating} />
                <span className="text-xs font-medium text-slate-500">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{review.comment}</p>

          {replies.length > 0 ? (
            <div className="mt-5 space-y-4 border-l border-slate-200 pl-4 sm:pl-5">
              {replies.map((reply) => (
                <div key={reply.uid} className="flex gap-3">
                  <Avatar size="sm" className="mt-0.5 size-8">
                    <AvatarImage src={reply.user.avatar_url} alt={reply.user.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-500">
                      <UserRound className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold leading-5 text-slate-950">{reply.user.name}</span>
                      <Badge variant="coursePublished" className="rounded-md border-emerald-100 px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal">
                        Balasan
                      </Badge>
                      <span className="text-xs leading-5 text-slate-500">{formatReviewDate(reply.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {canReply ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Reply className="size-3.5" />
                {isAdmin ? 'Balas sebagai admin' : 'Tulis balasan'}
              </div>
              <Textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Tulis balasan yang jelas dan membantu..."
                className="min-h-24 resize-none border-slate-200 bg-slate-50 text-sm leading-6 shadow-none focus-visible:bg-white"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">Balasan akan muncul sebagai thread di bawah review ini.</p>
                <Button type="button" size="sm" className="h-9 rounded-xl px-3 text-sm font-semibold" disabled={!replyText.trim()} onClick={handleSendReply}>
                  <Send className="size-4" />
                  Kirim
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
