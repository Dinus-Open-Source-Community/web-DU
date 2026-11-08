import type { ReactNode } from 'react'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailMobileCtaProps = {
  children: ReactNode
  className?: string
}

export function CourseDetailMobileCta({
  children,
  className,
}: CourseDetailMobileCtaProps) {
  return (
    <div className={cn(detailLayout.stickyBar, className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
        <div className="w-full [&_a]:w-full [&_button]:min-h-11 [&_button]:w-full [&_button]:rounded-xl [&_button]:px-5 [&_button]:text-sm [&_button]:font-semibold">
          {children}
        </div>
      </div>
    </div>
  )
}
