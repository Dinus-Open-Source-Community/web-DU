import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Loader2, Send, UserRound } from 'lucide-react'

import { SubmissionDetailSection } from '@/components/shared/course-detail-manage/SubmissionDetailSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import {
  formatGraderRoleLabel,
  presentSubmissionGrader,
  type StaffSubmissionViewer,
} from '@/lib/course-detail/staff-submission-grader-presenter'
import type { ICourseStaffSubmission } from '@/lib/types/features/course-detail-assignments'
import { Initials } from '@/lib/func/func'

type StaffSubmissionFeedbackSectionProps = {
  submission: ICourseStaffSubmission
  staffViewer: StaffSubmissionViewer | null
  onSubmit: (feedback: string) => Promise<void>
  isSubmitting: boolean
}

function formatFeedbackDate(value: string | null) {
  if (!value) return null
  return format(new Date(value), 'd MMM yyyy HH:mm', { locale: id })
}

function StaffSubmissionFeedbackThread({
  submission,
  staffViewer,
}: {
  submission: ICourseStaffSubmission
  staffViewer: StaffSubmissionViewer | null
}) {
  const grader = presentSubmissionGrader(submission.gradedByUid, staffViewer)
  const graderName = grader?.name ?? 'Penilai'
  const roleLabel = formatGraderRoleLabel(grader?.role)
  const feedbackDate = formatFeedbackDate(submission.gradedAt)

  return (
    <div className={manageDetailLayout.submissionDetailThread}>
      <div className="flex gap-3 sm:gap-4">
        <Avatar size="sm" className="mt-0.5 size-8 shrink-0">
          {grader?.avatar_url ? (
            <AvatarImage src={grader.avatar_url} alt={graderName} />
          ) : null}
          <AvatarFallback className="bg-slate-100 text-slate-500">
            {grader ? (
              <span className="text-[10px] font-semibold">{Initials(graderName)}</span>
            ) : (
              <UserRound className="size-3.5" aria-hidden />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold leading-5 text-slate-950">{graderName}</span>
            {roleLabel ? (
              <Badge
                variant="outline"
                className="rounded-md px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal"
              >
                {roleLabel}
              </Badge>
            ) : null}
            <Badge
              variant="coursePublished"
              className="rounded-md border-emerald-100 px-1.5 py-0 text-[10px] font-semibold normal-case tracking-normal"
            >
              Feedback
            </Badge>
            {feedbackDate ? (
              <span className="text-xs leading-5 text-slate-500">{feedbackDate}</span>
            ) : null}
          </div>
          <p className={`mt-2 ${manageDetailLayout.submissionDetailBody}`}>
            {submission.feedback}
          </p>
        </div>
      </div>
    </div>
  )
}

export function StaffSubmissionFeedbackSection({
  submission,
  staffViewer,
  onSubmit,
  isSubmitting,
}: StaffSubmissionFeedbackSectionProps) {
  const [feedbackText, setFeedbackText] = useState('')

  useEffect(() => {
    setFeedbackText('')
  }, [submission.uid])

  const handleSubmit = async () => {
    const comment = feedbackText.trim()
    if (!comment || isSubmitting) return
    await onSubmit(comment)
    setFeedbackText('')
  }

  const hasFeedback = Boolean(submission.feedback?.trim())
  const composeLabelId = 'submission-feedback-compose'

  return (
    <SubmissionDetailSection
      title="Feedback"
      description="Feedback terbaru mengganti feedback sebelumnya untuk kiriman ini."
    >
      {hasFeedback ? (
        <StaffSubmissionFeedbackThread submission={submission} staffViewer={staffViewer} />
      ) : (
        <p className="text-sm text-slate-500">Belum ada feedback untuk jawaban ini.</p>
      )}

      <div className="mt-5 space-y-2">
        <Label htmlFor={composeLabelId} className="text-xs font-semibold text-slate-600">
          {hasFeedback ? 'Perbarui feedback' : 'Tulis feedback'}
        </Label>
        <Textarea
          id={composeLabelId}
          value={feedbackText}
          onChange={(event) => setFeedbackText(event.target.value)}
          placeholder="Tulis feedback yang jelas dan membantu untuk siswa..."
          disabled={isSubmitting}
          className="min-h-24 resize-none text-sm leading-6"
        />
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            className="h-9 px-3 text-sm font-semibold"
            disabled={!feedbackText.trim() || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {isSubmitting ? 'Mengirim...' : hasFeedback ? 'Perbarui feedback' : 'Kirim feedback'}
          </Button>
        </div>
      </div>
    </SubmissionDetailSection>
  )
}
