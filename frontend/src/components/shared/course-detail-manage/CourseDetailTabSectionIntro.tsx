import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailTabSectionIntroProps = {
  title: string
  description: string
  icon: LucideIcon
  aside?: ReactNode
  className?: string
}

/** Judul tab detail kursus — sama pola dengan tab Kurikulum (ikon + judul + kalimat penjelas). */
export function CourseDetailTabSectionIntro({
  title,
  description,
  icon: Icon,
  aside,
  className,
}: CourseDetailTabSectionIntroProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Icon className="size-4 text-ink-400" aria-hidden />
          {title}
        </div>
        <p className={cn(manageDetailLayout.meta, 'mt-1 leading-6')}>{description}</p>
      </div>
      {aside ? <div className="flex flex-wrap items-center gap-2">{aside}</div> : null}
    </div>
  )
}
