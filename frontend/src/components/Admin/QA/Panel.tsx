import { useState } from 'react'
import { Loader2, MessageCircle, Star } from 'lucide-react'

import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
        <Loader2 className="size-6 animate-spin text-slate-400" aria-hidden />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<Star className="h-5 w-5" />}
        title={courseUid ? 'Belum ada review untuk course ini' : 'Belum ada review'}
        description={
          courseUid
            ? 'Review siswa untuk course yang dipilih akan tampil di sini.'
            : 'Review siswa akan tampil di sini setelah mereka menyelesaikan course.'
        }
      />
    )
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full text-left">
          <thead className="bg-slate-50/80">
            <tr className="border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500">
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

function ReviewRow({ review }: { review: AdminReview }) {
  const replyMutation = useReplyAdminReview()
  const [showReply, setShowReply] = useState(false)
  const [reply, setReply] = useState('')
  const isSubmitting = replyMutation.isPending

  const handleSendReply = async () => {
    const comment = reply.trim()
    if (comment.length < 3 || isSubmitting) return

    try {
      await replyMutation.mutateAsync({
        reviewUid: review.uid,
        comment,
      })
      setReply('')
      setShowReply(false)
    } catch {
      // Toast ditangani mutation hook.
    }
  }

  return (
    <>
      <tr className="border-b border-slate-200/70 align-top text-sm text-slate-700">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <UserAvatarImage
              src={review.studentAvatar}
              alt={review.studentName}
              size={36}
              className="ring-1 ring-slate-100"
            />
            <p className="max-w-45 truncate font-semibold text-slate-900">{review.studentName}</p>
          </div>
        </td>
        <td className="px-4 py-4">
          <Badge variant="categoryDefault">{review.courseTitle}</Badge>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'h-3.5 w-3.5',
                  index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300',
                )}
                aria-hidden
              />
            ))}
          </div>
        </td>
        <td className="px-4 py-4">
          <p className="line-clamp-3 min-w-56 leading-relaxed">{review.comment}</p>
        </td>
        <td className="px-4 py-4 text-xs text-slate-500">{review.createdAt}</td>
        <td className="px-4 py-4">
          {review.reply ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">
                Balasan dari {review.reply.author} • {review.reply.createdAt}
              </p>
              <p className="mt-1 text-sm text-slate-700">{review.reply.comment}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-fit gap-1.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
              onClick={() => setShowReply(true)}
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Balas review
            </Button>
          )}
        </td>
      </tr>

      {showReply ? (
        <tr className="border-b border-slate-200/70 bg-slate-50/50">
          <td className="px-4 py-4" colSpan={6}>
            <div className="flex max-w-3xl flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-3">
              <Textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Tulis balasan kepada siswa..."
                disabled={isSubmitting}
                className="min-h-22.5 resize-none bg-white text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowReply(false)
                    setReply('')
                  }}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={reply.trim().length < 3 || isSubmitting}
                  onClick={() => void handleSendReply()}
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Kirim balasan
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
