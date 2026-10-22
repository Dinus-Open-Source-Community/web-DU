import { useState } from 'react'
import { Loader2, MessageSquare, SendHorizontal, Star } from 'lucide-react'

import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { ReviewLottieIllustration } from '@/components/playful/ReviewLottieIllustration'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { formatCourseRatingLabel } from '@/lib/course-detail/course-rating'
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
            <tr className="border-b border-line-light text-xs font-medium text-ink-500">
              <th className="px-4 py-3">Siswa</th>
              <th className="px-4 py-3">Kursus</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Ulasan</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Balasan</th>
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

function ReviewRatingStars({ rating, showLabel = false }: { rating: number; showLabel?: boolean }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating ${rating} dari 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'h-3.5 w-3.5',
              index < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-ink-300 dark:text-ink-600',
            )}
            aria-hidden
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold tabular-nums text-ink-900">
          {formatCourseRatingLabel(rating)}
        </span>
      )}
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
  const trimmed = reply.trim()
  const canSubmit = trimmed.length >= 3 && !isSubmitting

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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl rounded-2xl border-line-light">
        {/* Header */}
        <DialogHeader className="border-b border-line-light px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft border border-brand-blue/30 text-brand-ink">
              <MessageSquare className="size-4" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold text-ink-900">
                Balas Ulasan Siswa
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-500 leading-relaxed">
                Tanggapan resmi Anda akan dipublikasikan langsung di bawah ulasan siswa pada halaman kursus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Review Context Card */}
          <div className="flex flex-col gap-3 rounded-xl border border-line-light bg-paper-offwhite/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatarImage
                  src={review.studentAvatar}
                  alt={review.studentName}
                  size={36}
                  className="ring-1 ring-border shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{review.studentName}</p>
                  <p className="text-xs text-ink-500 truncate max-w-[200px] sm:max-w-[280px]">
                    {review.courseTitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <ReviewRatingStars rating={review.rating} showLabel />
                <span className="text-[11px] text-ink-400 tabular-nums">{review.createdAt}</span>
              </div>
            </div>

            <div className="border-l-2 border-brand-blue/60 pl-3.5 py-1 bg-paper-white/60 rounded-r-lg">
              <p className="text-sm leading-relaxed text-ink-800 italic">
                "{review.comment}"
              </p>
            </div>
          </div>

          {/* Reply Form */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={`review-reply-${review.uid}`} className="font-medium text-ink-700">
                Tanggapan Anda
              </label>
              <span className={cn('tabular-nums text-xs', trimmed.length >= 3 ? 'text-ink-400' : 'text-amber-600 font-medium')}>
                {trimmed.length} karakter (min. 3)
              </span>
            </div>

            <Textarea
              id={`review-reply-${review.uid}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Tuliskan tanggapan, apresiasi, atau klarifikasi secara ramah dan profesional..."
              disabled={isSubmitting}
              className="min-h-32 resize-none rounded-xl border-line-light bg-paper-white p-3.5 text-sm leading-relaxed placeholder:text-ink-400 focus-visible:border-ink-900 focus-visible:ring-1 focus-visible:ring-ink-900/10"
            />
            <p className="text-[11px] text-ink-400">
              Gunakan bahasa yang sopan dan solutif untuk menjaga kenyamanan peserta kursus.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-line-light px-6 py-4 bg-paper-paper/40 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-ink-400 hidden sm:block">
            Tanggapan tidak dapat diedit setelah dikirim.
          </p>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-line-light px-4 text-xs font-medium text-ink-700 hover:bg-paper-white"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg px-4 text-xs font-medium bg-ink-900 text-paper-white hover:bg-ink-800 gap-1.5 shadow-sm disabled:opacity-50"
              disabled={!canSubmit}
              onClick={() => void handleSendReply()}
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <SendHorizontal className="size-3.5" aria-hidden />
              )}
              Kirim balasan
            </Button>
          </div>
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
          <ReviewRatingStars rating={review.rating} showLabel />
        </td>
        <td className="px-4 py-4">
          <p className="line-clamp-3 min-w-56 leading-relaxed text-ink-700">{review.comment}</p>
        </td>
        <td className="px-4 py-4 text-xs text-ink-500">{review.createdAt}</td>
        <td className="px-4 py-4">
          {review.reply ? (
            <div className="rounded-lg border border-line-light bg-paper-paper/70 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-ink-600">
                <span>Balasan dari {review.reply.author}</span>
                <span className="text-line-medium">·</span>
                <span className="tabular-nums text-ink-400">{review.reply.createdAt}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-800">{review.reply.comment}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-fit gap-1.5 rounded-lg border-line-light px-3 text-xs font-medium text-ink-800 shadow-none hover:bg-paper-paper hover:border-ink-900/20"
              onClick={() => setReplyDialogOpen(true)}
            >
              <MessageSquare className="size-3.5 text-ink-500" aria-hidden />
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
