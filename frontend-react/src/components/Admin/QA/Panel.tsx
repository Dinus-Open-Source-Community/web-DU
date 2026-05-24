import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import type { AdminReview } from '@/lib/types/course'

type ReviewsPanelProps = {
  courseUid: string
  dataAdminReviews: AdminReview[]
}

export function ReviewsPanel({ courseUid, dataAdminReviews }: ReviewsPanelProps) {
  if (dataAdminReviews.length === 0) {
    return (
      <EmptyState
        icon={<Star className="h-5 w-5" />}
        title={courseUid ? 'Belum ada review untuk course ini' : 'Belum ada review'}
        description={courseUid ? 'Review siswa untuk course yang dipilih akan tampil di sini.' : 'Review siswa akan tampil di sini setelah mereka menyelesaikan course.'}
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
            {dataAdminReviews.map((review) => (
              <ReviewRow key={review.uid} review={review} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReviewRow({ review }: { review: AdminReview }) {
  const [showReply, setShowReply] = useState(false)
  const [reply, setReply] = useState('')
  const [localReply, setLocalReply] = useState<AdminReview['reply'] | null>(null)

  const activeReply = localReply ?? review.reply

  const handleSendReply = () => {
    if (reply.trim().length < 3) return

    setLocalReply({
      author: 'Admin',
      comment: reply.trim(),
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    })
    setReply('')
    setShowReply(false)
  }

  return (
    <>
      <tr className="border-b border-slate-200/70 align-top text-sm text-slate-700">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
              <img src={review.studentAvatar} alt={review.studentName} className="object-cover" sizes="36px" />
            </div>
            <p className="max-w-45 truncate font-semibold text-slate-900">{review.studentName}</p>
          </div>
        </td>
        <td className="px-4 py-4">
          <Badge variant="categoryDefault">{review.courseTitle}</Badge>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} aria-hidden />
            ))}
          </div>
        </td>
        <td className="px-4 py-4">
          <p className="line-clamp-3 min-w-56 leading-relaxed">{review.comment}</p>
        </td>
        <td className="px-4 py-4 text-xs text-slate-500">{review.createdAt}</td>
        <td className="px-4 py-4">
          {activeReply ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">
                Balasan dari {activeReply.author} • {activeReply.createdAt}
              </p>
              <p className="mt-1 text-sm text-slate-700">{activeReply.comment}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-fit gap-1.5 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-50"
              onClick={() => setShowReply(true)}>
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
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Tulis balasan kepada siswa..." className="min-h-22.5 resize-none bg-white text-sm" />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200"
                  onClick={() => {
                    setShowReply(false)
                    setReply('')
                  }}>
                  Batal
                </Button>
                <Button size="sm" className="h-8 rounded-lg" disabled={reply.trim().length < 3} onClick={handleSendReply}>
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
