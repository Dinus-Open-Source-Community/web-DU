import type { ReactNode } from 'react'

import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type SubmissionDetailSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  withTopDivider?: boolean
}

export function SubmissionDetailSection({
  title,
  description,
  children,
  className,
  withTopDivider = true,
}: SubmissionDetailSectionProps) {
  return (
    <section
      className={cn(
        withTopDivider && manageDetailLayout.submissionDetailSection,
        className,
      )}
    >
      <header className="mb-4 space-y-1">
        <h2 className={manageDetailLayout.submissionDetailSectionTitle}>{title}</h2>
        {description ? (
          <p className={manageDetailLayout.submissionDetailSectionDesc}>{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
