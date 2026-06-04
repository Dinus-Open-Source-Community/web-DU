import { cn } from '@/lib/utils'
import CardCourse from '@/components/shared/CardCourse'
import type { ICourseItem } from '@/lib/types/course'

interface PopularCoursesStripProps {
  title?: string
  items: ICourseItem[]
  baseHref?: string
  className?: string
}

export function PopularCoursesStrip({ title = 'Popular Courses', items, className }: PopularCoursesStripProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div key={item.uid} className="w-[280px] shrink-0 sm:w-[300px]">
            <CardCourse size="sm" data={item as ICourseItem} />
          </div>
        ))}
      </div>
    </section>
  )
}
