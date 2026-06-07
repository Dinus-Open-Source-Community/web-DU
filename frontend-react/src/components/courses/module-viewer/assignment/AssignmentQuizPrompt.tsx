import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '../utils'

type AssignmentQuizPromptProps = {
  index: number
  promptHtml: string
  theme: LessonThemeMode
  className?: string
}

export function AssignmentQuizPrompt({ index, promptHtml, theme, className }: AssignmentQuizPromptProps) {
  const isDark = theme === 'dark'

  return (
    <div className={cn('space-y-2', className)}>
      <p className={cn('text-sm font-semibold', isDark ? 'text-zinc-300' : 'text-slate-700')}>
        {index + 1}.
      </p>
      <div className={cn('lesson-reader text-sm leading-6', isDark ? 'lesson-reader--dark text-zinc-100' : 'lesson-reader--light text-slate-900')}>
        <div className="tiptap-editor-root tiptap-preview">
          <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: promptHtml }} />
        </div>
      </div>
    </div>
  )
}
