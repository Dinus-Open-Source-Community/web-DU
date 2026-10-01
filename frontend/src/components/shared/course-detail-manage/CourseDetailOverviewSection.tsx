import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

import type { CourseDetailTabValue } from '@/components/shared/course-detail-manage/CourseDetailNavTabs'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CourseDetailOverviewSectionProps = {
  title: string
  description?: string
  icon: LucideIcon
  tab: CourseDetailTabValue
  tabLabel: string
  onNavigateToTab: (tab: CourseDetailTabValue) => void
  className?: string
  children: ReactNode
}

export function CourseDetailOverviewSection({
  title,
  description,
  icon: Icon,
  tab,
  tabLabel,
  onNavigateToTab,
  className,
  children,
}: CourseDetailOverviewSectionProps) {
  return (
    <section className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding, className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className={cn(manageDetailLayout.sectionTitle, 'flex items-center gap-2')}>
            <Icon className="size-4 text-ink-400" aria-hidden />
            {title}
          </h3>
          {description ? <p className={cn(manageDetailLayout.meta, 'mt-1 max-w-xl')}>{description}</p> : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(manageDetailLayout.actionButton, 'h-9 shrink-0 px-3 text-xs')}
          onClick={() => onNavigateToTab(tab)}
        >
          {tabLabel}
          <ArrowRight className="ml-1.5 size-3.5 opacity-70" aria-hidden />
        </Button>
      </div>
      {children}
    </section>
  )
}
