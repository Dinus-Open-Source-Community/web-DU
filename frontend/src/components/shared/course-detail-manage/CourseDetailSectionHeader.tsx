import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailSectionHeaderProps = {
  title: string
  description?: string
}

export function CourseDetailSectionHeader({ title, description }: CourseDetailSectionHeaderProps) {
  return (
    <header className="space-y-1 border-b border-border pb-5">
      <h2 className={cn(manageDetailLayout.sectionTitle, 'text-lg sm:text-xl')}>{title}</h2>
      {description ? (
        <p className={cn(manageDetailLayout.pageSubtitle, 'max-w-2xl')}>{description}</p>
      ) : null}
    </header>
  )
}
