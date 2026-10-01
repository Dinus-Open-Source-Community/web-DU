import { useState } from 'react'
import { Loader2, MessageCircle, Star } from 'lucide-react'

import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { ReviewLottieIllustration } from '@/components/playful/ReviewLottieIllustration'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { appCardClassName, appCardHeaderClassName } from '@/lib/design/app-shell-tokens'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useReplyAdminReview } from '@/hooks/use-admin-moderation'
import type { AdminReview } from '@/lib/types/course'
import { cn } from '@/lib/utils'

type ReviewsPanelProps = {
  courseUid?: string
  reviews: AdminReview[]
  isLoading?: boolean
}

export function ReviewsPanel({ courseUid, reviews, isLoading = false }: ReviewsPanelProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          appCardClassName,
          'flex min-h-48 items-center justify-center',
        )}
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className={cn(appCardClassName, 'flex flex-col items-center px-6 py-10 text-center')}>
        <ReviewLottieIllustration className="mb-2 max-w-[14rem]" height="200px" />
        <EmptyState
          hideIcon
          className="border-0 bg-transparent px-0 py-0"
          title={courseUid ? 'Belum ada review untuk course ini' : 'Belum ada review'}
          description={
            courseUid
              ? 'Review siswa untuk course yang dipilih akan tampil di sini.'
              : 'Review siswa akan tampil di sini setelah mereka menyelesaikan course.'
          }
        />
      </div>
    )
  }

  return (
    <section className={cn(appCardClassName, 'w-full overflow-hidden')}>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full text-left">
          <thead className={cn('bg-paper-paper', appCardHeaderClassName)}>
            <tr className="border-b border-line-light text-xs uppercase tracking-wider text-ink-500">
              <th className="px-4 py-3 font-semibold">Siswa</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 font-semibold">Review</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Balasan</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <ReviewRow key={review.uid} review={review} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReviewRatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-3.5 w-3.5',
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-ink-400',
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}

type ReviewReplyDialogProps = {
  review: AdminReview
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ReviewReplyDialog({ review, open, onOpenChange }: ReviewReplyDialogProps) {
  const replyMutation = useReplyAdminReview()
  const [reply, setReply] = useState('')
  const isSubmitting = replyMutation.isPending
  const canSubmit = reply.trim().length >= 3 && !isSubmitting

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReply('')
    onOpenChange(nextOpen)
  }

  const handleSendReply = async () => {
    const comment = reply.trim()
    if (comment.length < 3 || isSubmitting) return

    try {
      await replyMutation.mutateAsync({
        reviewUid: review.uid,
        comment,
      })
      setReply('')
      onOpenChange(false)
    } catch {
      // Toast ditangani mutation hook.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-line-light px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="size-5 text-primary" aria-hidden />
            Balas review
          </DialogTitle>
          <DialogDescription>
            Balasan akan tampil di bawah ulasan siswa pada halaman course.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="rounded-xl border border-line-light bg-paper-paper/80 p-4">
            <div className="flex items-start gap-3">
              <UserAvatarImage
                src={review.studentAvatar}
                alt={review.studentName}
                size={40}
                className="ring-1 ring-border"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-semibold text-ink-900">{review.studentName}</p>
                <AdminMetaLabel className="max-w-full truncate">{review.courseTitle}</AdminMetaLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <ReviewRatingStars rating={review.rating} />
                  <span className="text-xs text-ink-500">{review.createdAt}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.comment}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor={`review-reply-${review.uid}`} className="text-sm font-semibold text-ink-900">
              Balasan Anda
            </label>
            <Textarea
              id={`review-reply-${review.uid}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Tulis balasan kepada siswa..."
              disabled={isSubmitting}
              className="min-h-28 resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-line-light px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-sm border-border"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-sm"
            disabled={!canSubmit}
            onClick={() => void handleSendReply()}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Kirim balasan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewRow({ review }: { review: AdminReview }) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)

  return (
    <>
      <tr className="border-b border-line-light align-top text-sm text-ink-700">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <UserAvatarImage
              src={review.studentAvatar}
              alt={review.studentName}
              size={36}
              className="ring-1 ring-border"
            />
            <p className="max-w-45 truncate font-semibold text-ink-900">{review.studentName}</p>
          </div>
        </td>
        <td className="px-4 py-4">
          <AdminMetaLabel className="max-w-48 truncate">{review.courseTitle}</AdminMetaLabel>
        </td>
        <td className="px-4 py-4">
          <ReviewRatingStars rating={review.rating} />
        </td>
        <td className="px-4 py-4">
          <p className="line-clamp-3 min-w-56 leading-relaxed text-ink-700">{review.comment}</p>
        </td>
        <td className="px-4 py-4 text-xs text-ink-500">{review.createdAt}</td>
        <td className="px-4 py-4">
          {review.reply ? (
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-3">
              <p className="text-xs font-semibold text-primary">
                Balasan dari {review.reply.author} • {review.reply.createdAt}
              </p>
              <p className="mt-1 text-sm text-ink-700">{review.reply.comment}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-fit gap-1.5 rounded-sm border-border text-xs font-semibold text-foreground shadow-none hover:bg-muted"
              onClick={() => setReplyDialogOpen(true)}
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Balas review
            </Button>
          )}
        </td>
      </tr>

      <ReviewReplyDialog
        review={review}
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
      />
    </>
  )
}
