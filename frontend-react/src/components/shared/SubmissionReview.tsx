'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { IMentorAssignmentSubmission } from '@/lib/types/course'
import { SubmissionContentView } from './SubmissionContent'
import { ConfirmDialog } from './ConfirmDialog'
import { saveSubmissionReview } from '@/lib/func/fungsi'

type SubmissionReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: IMentorAssignmentSubmission | null
  assignmentTitle: string
  onSaved: (updated: IMentorAssignmentSubmission) => void
}

export function SubmissionReviewDialog({ open, onOpenChange, submission, assignmentTitle, onSaved }: SubmissionReviewDialogProps) {
  const [rating, setRating] = useState<number>(3)
  const [comment, setComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState<IMentorAssignmentSubmission['reviewStatus']>('graded')
  const [saving, setSaving] = useState(false)
  const [isConfirm, setIsConfirm] = useState(false)

  const syncFromSubmission = useCallback((s: IMentorAssignmentSubmission | null) => {
    if (!s) return
    setRating(s.rating ?? 3)
    setComment(s.mentorComment ?? '')
    setReviewStatus(s.reviewStatus === 'pending_review' ? 'graded' : s.reviewStatus)
  }, [])

  useEffect(() => {
    if (open && submission) syncFromSubmission(submission)
  }, [open, submission, syncFromSubmission])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSave = useCallback(async () => {
    if (!submission) return
    setIsConfirm(true)
    setSaving(true)
    try {
      const reviewedAt = new Date().toISOString()
      const patch = {
        rating,
        mentorComment: comment.trim() || null,
        reviewStatus,
        reviewedAt,
      }
      saveSubmissionReview(submission.uid, patch)
      onSaved({ ...submission, ...patch })
      toast.success('Review disimpan.')
      handleClose()
    } catch {
      toast.error('Gagal menyimpan review.')
    } finally {
      setSaving(false)
    }
  }, [setIsConfirm, submission, rating, comment, reviewStatus, onSaved, handleClose])

  if (!open || !submission) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      {isConfirm && <ConfirmDialog open={isConfirm} onOpenChange={setIsConfirm} title="" />}
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={handleClose} />
      <div className="relative z-10 flex max-h-[min(92vh,960px)] w-full max-w-[min(96rem,calc(100vw-2rem))] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review kiriman</p>
            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{submission.studentName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {assignmentTitle} · Attempt {submission.attemptNumber} · {format(new Date(submission.submittedAt), 'd MMM yyyy HH:mm', { locale: id })}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Konten siswa</p>
          <SubmissionContentView blocks={submission.contentBlocks} />
        </div>

        <div className="shrink-0 space-y-4 border-t border-slate-100 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="review-status" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                id="review-status"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as IMentorAssignmentSubmission['reviewStatus'])}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="graded">Selesai dinilai</option>
                <option value="returned">Minta revisi</option>
                <option value="pending_review">Belum dinilai</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="review-rating" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rating (1–5)
              </label>
              <select
                id="review-rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="review-comment" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Komentar mentor
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Feedback untuk siswa…"
              className="resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl shadow-none" onClick={handleClose}>
              Batal
            </Button>
            <Button type="button" className="rounded-xl" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan review'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
