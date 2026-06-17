import { useEffect, useState, type KeyboardEvent } from 'react'
import { Check, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'

type LessonTitleRenameFieldProps = {
  lessonId: string
  title: string
  isSaving?: boolean
  onSave: (title: string) => void | Promise<void>
  onCancel: () => void
  className?: string
  compact?: boolean
}

export function LessonTitleRenameField({
  lessonId,
  title,
  isSaving = false,
  onSave,
  onCancel,
  className,
  compact = false,
}: LessonTitleRenameFieldProps) {
  const [draftTitle, setDraftTitle] = useState(title)

  useEffect(() => {
    setDraftTitle(title)
  }, [title])

  const commitRename = async () => {
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      onCancel()
      return
    }
    await onSave(trimmed)
  }

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void commitRename()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setDraftTitle(title)
      onCancel()
    }
  }

  return (
    <div
      className={cn(
        'flex min-w-0 items-center overflow-hidden border border-slate-200 bg-white',
        editLayout.control,
        'focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20',
        className,
      )}
    >
      <label htmlFor={`lesson-title-${lessonId}`} className="sr-only">
        Nama lesson
      </label>
      <input
        id={`lesson-title-${lessonId}`}
        autoFocus
        value={draftTitle}
        disabled={isSaving}
        onChange={(event) => setDraftTitle(event.target.value)}
        onKeyDown={handleTitleKeyDown}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent px-3 font-semibold text-slate-900 outline-none disabled:opacity-60',
          compact ? 'py-2 text-base' : 'py-2.5 text-lg sm:text-xl',
        )}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="mr-1 size-8 shrink-0 rounded-md text-primary hover:bg-primary/10 hover:text-primary"
        aria-label="Simpan nama lesson"
        disabled={isSaving}
        onClick={() => void commitRename()}
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Check className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  )
}
