'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { listReviewsForCourse } from '@/lib/data/repository'
import { cn } from '@/lib/utils'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn('h-3.5 w-3.5', index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} aria-hidden />
      ))}
    </div>
  )
}

export function CourseReviewsSection({ courseUid }: { courseUid: string }) {
  const reviews = listReviewsForCourse(courseUid)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">Reviews peserta</h3>
          <p className="mt-1 text-xs text-slate-500">Ulasan penuh dari peserta untuk kursus ini.</p>
        </div>
        <Badge variant="categoryDefault">{reviews.length} review</Badge>
      </div>

      {reviews.length === 0 ? (
        <EmptyState className="border-slate-200/70 bg-slate-50/60 py-10" title="Belum ada review" description="Review peserta kursus akan muncul di sini setelah terkumpul." />
      ) : (
        <ScrollArea className="h-[460px] pr-3">
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <article key={review.uid} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    <Image src={review.studentAvatar} alt={review.studentName} fill className="object-cover" sizes="40px" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{review.studentName}</p>
                        <p className="text-xs text-slate-500">{review.createdAt}</p>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>

                    {review.reply ? (
                      <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-semibold text-primary">
                          Balasan dari {review.reply.author} • {review.reply.createdAt}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">{review.reply.comment}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
