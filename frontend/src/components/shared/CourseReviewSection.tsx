import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Loader2, Reply, Send, Star, UserRound } from 'lucide-react'
import type { CourseDetailReview } from '@/lib/types/course'
import { ReviewLottieIllustration } from '@/components/playful/ReviewLottieIllustration'
import { CourseDetailTabSectionIntro } from '@/components/shared/course-detail-manage/CourseDetailTabSectionIntro'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface CourseReviewSectionProps {
  reviews: CourseDetailReview[]
  isAdmin?: boolean
  staffShellChrome?: boolean
  onReply?: (reviewUid: string, comment: string) => Promise<void>
  submittingReviewUid?: string | null
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
        <Star key={index} className={cn(size === 'md' ? 'size-4' : 'size-3.5', index < normalizedRating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-border')} />
      ))}
    </div>
  )
}

export function CourseReviewSection({
  reviews,
  isAdmin,
  staffShellChrome = false,
  onReply,
  submittingReviewUid = null,
}: CourseReviewSectionProps) {
  const useStaffLabels = staffShellChrome || isAdmin
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
      <CourseDetailTabSectionIntro
        className="mb-5"
        icon={Star}
        title="Ulasan kursus"
        description="Lihat rating, distribusi bintang, dan balasan peserta untuk kursus ini."
      />

      <section className="border-b border-line-light pb-6">
        <div className="grid gap-0 overflow-hidden rounded-xl border-2 border-ink-900/10 bg-paper-white shadow-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.12fr)]">
          <div className="border-b border-line-light px-1 py-4 sm:px-4 lg:border-b-0 lg:border-r lg:px-6">
            <p className={manageDetailLayout.tableHead}>Total ulasan</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-[32px] font-semibold leading-none tabular-nums text-foreground">{formatCompactNumber(reviews.length)}</p>
              {totalReplies > 0 ? (
                <span className="text-[11px] font-medium leading-5 text-emerald-600 dark:text-emerald-400">
                  {formatCompactNumber(totalReplies)} balasan
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Jumlah ulasan yang sudah dikirim peserta</p>
          </div>

          <div className="border-b border-line-light px-1 py-4 sm:px-4 lg:border-b-0 lg:border-r lg:px-6">
            <p className={manageDetailLayout.tableHead}>Rating rata-rata</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-[32px] font-semibold leading-none tabular-nums text-foreground">{averageRating.toFixed(1)}</p>
              <ReviewStars rating={averageRating} size="md" />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Skor rata-rata dari semua ulasan</p>
          </div>

          <div className="px-1 py-3 sm:px-4 lg:px-6">
            <p className={cn(manageDetailLayout.tableHead, 'mb-2 px-0.5')}>Distribusi bintang</p>
            <div className="space-y-1.5">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="grid grid-cols-[16px_minmax(0,1fr)_44px] items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">{item.stars}</span>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${item.count} ulasan dengan rating ${item.stars}`}>
                    <div className={cn('h-full rounded-full', ratingBarColor(item.stars))} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-right text-xs font-medium tabular-nums text-muted-foreground">{formatCompactNumber(item.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {reviews.length === 0 ? (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-ink-900/10 bg-paper-paper/80 px-5 py-12 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
            <ReviewLottieIllustration className="mb-1 max-w-[14rem]" height="180px" />
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Belum ada ulasan</h3>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                Ulasan dan balasan akan muncul setelah peserta mengirim penilaian.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <ReviewItem
              key={review.uid}
              review={review}
              useStaffLabels={useStaffLabels}
              isAdmin={isAdmin}
              onReply={onReply}
              isSubmitting={submittingReviewUid === review.uid}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ReviewItem({
  review,
  useStaffLabels,
  isAdmin,
  onReply,
  isSubmitting = false,
}: {
  review: CourseDetailReview
  useStaffLabels?: boolean
  isAdmin?: boolean
  onReply?: (uid: string, comment: string) => Promise<void>
  isSubmitting?: boolean
}) {
  const [replyText, setReplyText] = useState('')
  const canReply = Boolean(onReply)
  const rating = Number.isFinite(review.rating) ? review.rating : 0
  const replies = review.replies ?? []

  const handleSendReply = async () => {
    const comment = replyText.trim()
    if (!comment || !onReply || isSubmitting) return

    try {
      await onReply(review.uid, comment)
      setReplyText('')
    } catch {
      // Error toast ditangani oleh mutation hook.
    }
  }

  return (
    <article className="py-5 sm:py-6">
      <div className="flex gap-3 sm:gap-4">
        <Avatar className="size-10">
          <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            <UserRound className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold leading-5 text-foreground">{review.user.name}</h3>
                <span className="text-xs leading-5 text-muted-foreground">{formatReviewDate(review.created_at)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <ReviewStars rating={rating} />
                <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{review.comment}</p>

          {replies.length > 0 ? (
            <div className="mt-5 space-y-4 border-l border-line-light pl-4 sm:pl-5">
              {replies.map((reply) => (
                <div key={reply.uid} className="flex gap-3">
                  <Avatar size="sm" className="mt-0.5 size-8">
                    <AvatarImage src={reply.user.avatar_url} alt={reply.user.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-xl border-2 border-ink-900/10 bg-paper-paper/80 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold leading-5 text-ink-900">{reply.user.name}</span>
                      {useStaffLabels ? (
                        <AdminMetaLabel>Balasan</AdminMetaLabel>
                      ) : (
                        <Badge
                          variant="coursePublished"
                          className="rounded-md border-emerald-100 px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal"
                        >
                          Balasan
                        </Badge>
                      )}
                      <span className="text-xs leading-5 text-muted-foreground">{formatReviewDate(reply.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {canReply ? (
            <div className="mt-5 rounded-2xl border-2 border-ink-900/10 bg-paper-white p-3 shadow-paper">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-900">
                <Reply className="size-3.5" />
                {isAdmin ? 'Balas sebagai admin' : 'Tulis balasan'}
              </div>
              <Textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Tulis balasan yang jelas dan membantu..."
                disabled={isSubmitting}
                className="min-h-24 resize-none border-ink-900/10 bg-paper-white text-sm leading-6 shadow-none"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">Balasan akan muncul sebagai thread di bawah ulasan ini.</p>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-sm px-3 text-sm font-semibold"
                  disabled={!replyText.trim() || isSubmitting}
                  onClick={() => void handleSendReply()}
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
