import { CheckCircle2 } from 'lucide-react'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

interface CourseWhatYouLearnProps {
  title?: string
  items: string[]
}

export function CourseWhatYouLearn({ title = 'Yang akan kamu pelajari', items }: CourseWhatYouLearnProps) {
  if (items.length === 0) return null

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
      <h2 className={cn(detailLayout.sectionTitle, 'mb-4')}>{title}</h2>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
