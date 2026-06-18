import { ExternalLink } from 'lucide-react'

import { SafeExternalLink } from '@/components/shared/SafeExternalLink'
import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { parseLessonContent } from '@/lib/rich-text'
import type { LessonDetailAssignment } from '@/lib/types/lesson'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentWorkInstructionsProps = {
  assignment: LessonDetailAssignment
  theme: LessonThemeMode
}

export function AssignmentWorkInstructions({ assignment, theme }: AssignmentWorkInstructionsProps) {
  const isDark = theme === 'dark'
  const instruction = assignment.task_description ? parseLessonContent(assignment.task_description) : null
  const attachments = assignment.instruction_attachments ?? []

  if (!instruction?.contentHtml && attachments.length === 0) return null

  return (
    <section className="space-y-4 border-t border-slate-200/80 pt-6 dark:border-zinc-800/80">
      <h2 className={cn('text-sm font-semibold', isDark ? 'text-zinc-200' : 'text-slate-800')}>
        {assignment.task_type === 'quiz' ? 'Petunjuk kuis' : 'Instruksi tugas'}
      </h2>

      {instruction?.contentHtml ? (
        <div className={cn('lesson-reader text-sm leading-7', isDark ? 'lesson-reader--dark' : 'lesson-reader--light')}>
          <div className="tiptap-editor-root tiptap-preview">
            <SanitizedHtml html={instruction.contentHtml} className="ProseMirror" />
          </div>
        </div>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment, index) => (
            <li key={`${attachment.url}-${index}`}>
              <SafeExternalLink
                href={attachment.url}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium hover:underline',
                  isDark ? 'text-sky-300' : 'text-primary',
                )}
              >
                <ExternalLink className="size-3.5" aria-hidden />
                {attachment.name || attachment.url}
              </SafeExternalLink>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
