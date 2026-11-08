import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type AssignmentQuizPromptProps = {
  index: number
  promptHtml: string
  theme: LessonThemeMode
  className?: string
}

export function AssignmentQuizPrompt({ index, promptHtml, theme, className }: AssignmentQuizPromptProps) {
  const isDark = theme === 'dark'

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <span
        className={cn(
          'text-sm font-semibold shrink-0 leading-6 m-0 p-0 select-none',
          isDark ? 'text-zinc-300' : 'text-ink-700',
        )}
      >
        {index + 1}.
      </span>
      <div
        className={cn(
          'min-w-0 flex-1 lesson-reader text-sm leading-6 [&_.ProseMirror]:leading-6 [&_.ProseMirror>p]:my-0 [&_.ProseMirror>:first-child]:mt-0 [&_.ProseMirror_img:first-child]:mt-0 [&_.ProseMirror>:last-child]:mb-0',
          isDark ? 'lesson-reader--dark text-zinc-100' : 'lesson-reader--light text-ink-900',
        )}
      >
        <div className="tiptap-editor-root tiptap-preview">
          <SanitizedHtml html={promptHtml} className="ProseMirror" />
        </div>
      </div>
    </div>
  )
}
