import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { editLayout } from '@/components/courses/(authorized)/curriculum/edit-layout'

type CourseEditCompactHeaderProps = {
  lessonTitle: string
  moduleLabel?: string
  onBackToOutline: () => void
}

export function CourseEditCompactHeader({
  lessonTitle,
  moduleLabel,
  onBackToOutline,
}: CourseEditCompactHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 py-3 backdrop-blur-sm supports-backdrop-filter:bg-white/80 lg:hidden">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`${editLayout.control} -ml-2 shrink-0 gap-1 px-2 text-slate-700`}
          onClick={onBackToOutline}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Kurikulum
        </Button>
      </div>

      <div className="mt-2 min-w-0 space-y-0.5">
        {moduleLabel && <p className={editLayout.fieldLabel}>{moduleLabel}</p>}
        <h2 className={`truncate ${editLayout.sectionTitle}`}>{lessonTitle}</h2>
      </div>
    </header>
  )
}
