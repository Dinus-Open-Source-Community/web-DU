import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { SubmissionDetailSection } from '@/components/shared/course-detail-manage/SubmissionDetailSection'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import {
  buildGradeDraftFromSubmission,
  type StaffSubmissionGradeDraft,
} from '@/lib/course-detail/staff-submission-grade-presenter'
import type { ICourseStaffSubmission } from '@/lib/types/features/course-detail-assignments'
import { cn } from '@/lib/utils'

type StaffSubmissionInlineGradePanelProps = {
  submission: ICourseStaffSubmission
  onSubmit: (draft: StaffSubmissionGradeDraft) => Promise<void>
  isSubmitting: boolean
}

export function StaffSubmissionInlineGradePanel({
  submission,
  onSubmit,
  isSubmitting,
}: StaffSubmissionInlineGradePanelProps) {
  const [scorePercent, setScorePercent] = useState('70')
  const [passed, setPassed] = useState(true)

  useEffect(() => {
    const draft = buildGradeDraftFromSubmission(submission)
    setScorePercent(String(draft.scorePercent))
    setPassed(draft.passed)
  }, [submission])

  const handleSubmit = async () => {
    const score = Number(scorePercent)
    if (Number.isNaN(score) || score < 0 || score > 100) return

    await onSubmit({
      scorePercent: score,
      passed,
    })
  }

  const isGraded = submission.gradingStatus === 'graded'

  return (
    <SubmissionDetailSection title="Penilaian">
      <div className={manageDetailLayout.submissionDetailFormGrid}>
        <div className="space-y-2">
          <Label htmlFor="inline-grade-score">Nilai (0-100)</Label>
          <Input
            id="inline-grade-score"
            type="number"
            min={0}
            max={100}
            value={scorePercent}
            onChange={(event) => setScorePercent(event.target.value)}
            className="h-10"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center gap-2 sm:pb-2">
          <Checkbox
            id="inline-grade-passed"
            checked={passed}
            onCheckedChange={(checked) => setPassed(checked === true)}
            disabled={isSubmitting}
          />
          <Label htmlFor="inline-grade-passed" className="font-normal text-slate-700">
            Dinyatakan lulus
          </Label>
        </div>

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="h-10 px-5 sm:self-end"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Menyimpan...
            </>
          ) : isGraded ? (
            'Perbarui nilai'
          ) : (
            'Simpan nilai'
          )}
        </Button>
      </div>

      <p
        className={cn(
          'mt-3 text-xs leading-5',
          isGraded ? 'text-slate-500' : 'text-amber-700',
        )}
      >
        {isGraded
          ? 'Perubahan nilai langsung memperbarui status penilaian siswa.'
          : 'Siswa belum dinilai. Simpan nilai untuk menandai tugas selesai dinilai.'}
      </p>
    </SubmissionDetailSection>
  )
}
