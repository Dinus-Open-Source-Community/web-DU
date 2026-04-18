'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { listAllReviews } from '@/lib/data/repository'
import type { AdminReview } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ReviewsPanel() {
  const adminReviews = listAllReviews()

  if (adminReviews.length === 0) {
    return (
      <EmptyState
        icon={<Star className="h-5 w-5" />}
        title="Belum ada review"
        description="Review siswa akan tampil di sini setelah mereka menyelesaikan kursus."
      />
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {adminReviews.map((r) => (
        <ReviewCard key={r.uid} review={r} />
      ))}
    </section>
  )
}

function ReviewCard({ review }: { review: AdminReview }) {
  const [showReply, setShowReply] = useState(false)
  const [reply, setReply] = useState('')

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
          <Image src={review.studentAvatar} alt={review.studentName} fill className="object-cover" sizes="40px" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {review.studentName}
            </span>
            <span className="text-xs text-slate-400">{review.createdAt}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="categoryDefault">{review.courseTitle}</Badge>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{review.comment}</p>

      {review.reply ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">
            Balasan dari {review.reply.author} • {review.reply.createdAt}
          </p>
          <p className="mt-1 text-sm text-slate-700">{review.reply.comment}</p>
        </div>
      ) : showReply ? (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis balasan kepada siswa..."
            className="min-h-[80px] resize-none bg-white text-sm"
          />
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
            <Button
              size="sm"
              className="h-8 rounded-lg"
              disabled={reply.trim().length < 3}
              onClick={() => {
                setShowReply(false)
                setReply('')
              }}>
              Kirim balasan
            </Button>
          </div>
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
    </article>
  )
}
