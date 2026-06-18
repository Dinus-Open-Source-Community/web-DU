import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { parseLessonContent } from '@/lib/rich-text'
import type { LessonAssignmentSubmissionRecord } from '@/lib/lesson-assignment/types'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentTextSubmissionViewProps = {
  submission: LessonAssignmentSubmissionRecord
  theme: LessonThemeMode
}

export function AssignmentTextSubmissionView({ submission, theme }: AssignmentTextSubmissionViewProps) {
  const isDark = theme === 'dark'
  const richContent = submission.richText ? parseLessonContent(submission.richText) : null

  return (
    <div className="space-y-4">
      {submission.plainText ? (
        <p className={cn('whitespace-pre-wrap text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-700')}>
          {submission.plainText}
        </p>
      ) : null}

      {richContent?.contentHtml ? (
        <div className={cn('lesson-reader', isDark ? 'lesson-reader--dark' : 'lesson-reader--light')}>
          <div className="tiptap-editor-root tiptap-preview">
            <SanitizedHtml html={richContent.contentHtml} className="ProseMirror" />
          </div>
        </div>
      ) : null}

      {submission.fileUrl ? (
        <div className="space-y-1.5">
          <SafeExternalLink
            href={submission.fileUrl}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            {submission.fileOriginalFilename || 'Unduh lampiran'}
          </SafeExternalLink>
          {submission.fileDescription ? (
            <p className={cn('text-xs', isDark ? 'text-zinc-400' : 'text-slate-500')}>{submission.fileDescription}</p>
          ) : null}
        </div>
      ) : null}

      {submission.grading.hasFeedback ? (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            isDark ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700',
          )}>
          <p className="font-semibold">Feedback mentor</p>
          <p className="mt-1 leading-relaxed">{submission.grading.feedback}</p>
        </div>
      ) : null}
    </div>
  )
}
