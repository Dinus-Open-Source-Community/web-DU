'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import type { IMentorAssignmentSubmission, SubmissionContentBlock } from '@/lib/types'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { saveSubmissionReview } from '@/lib/mentorAssignmentsData'
import { notifyError, notifyReviewSaved } from '@/lib/notify'

function ContentBlocksView({ blocks }: { blocks: SubmissionContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'text':
            return (
              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {b.text}
              </p>
            )
          case 'image':
            return (
              <figure key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={b.alt ?? 'Lampiran gambar'} className="max-h-72 w-full object-contain" loading="lazy" />
              </figure>
            )
          case 'file':
            return (
              <a
                key={i}
                href={b.url}
                download={b.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-slate-50">
                Unduh {b.fileName}
              </a>
            )
          case 'videoEmbed':
            return (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-100 bg-black/5">
                <div className="aspect-video w-full">
                  <iframe title={b.title ?? 'Video'} src={b.embedUrl} className="h-full w-full" allowFullScreen />
                </div>
              </div>
            )
          case 'link':
            return (
              <a
                key={i}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm font-medium text-primary underline-offset-2 hover:underline">
                {b.label ?? b.url}
              </a>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

type SubmissionReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: IMentorAssignmentSubmission | null
  assignmentTitle: string
  onSaved: (updated: IMentorAssignmentSubmission) => void
}

export function SubmissionReviewDialog({ open, onOpenChange, submission, assignmentTitle, onSaved }: SubmissionReviewDialogProps) {
  const confirm = useConfirm()
  const [rating, setRating] = useState<number>(3)
  const [comment, setComment] = useState('')
  const [reviewStatus, setReviewStatus] = useState<IMentorAssignmentSubmission['reviewStatus']>('graded')
  const [saving, setSaving] = useState(false)

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
    const agreed = await confirm({
      title: "Simpan review?",
      description: "Nilai dan komentar akan disimpan untuk kiriman ini.",
      confirmLabel: "Simpan",
    })
    if (!agreed) return
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
      notifyReviewSaved("Review disimpan.")
      handleClose()
    } catch {
      notifyError("Gagal menyimpan review.")
    } finally {
      setSaving(false)
    }
  }, [confirm, submission, rating, comment, reviewStatus, onSaved, handleClose])

  if (!open || !submission) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-label="Tutup" onClick={handleClose} />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review kiriman</p>
            <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{submission.studentName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {assignmentTitle} · Attempt {submission.attemptNumber} ·{' '}
              {format(new Date(submission.submittedAt), 'd MMM yyyy HH:mm', { locale: id })}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Konten siswa</p>
          <ContentBlocksView blocks={submission.contentBlocks} />
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
