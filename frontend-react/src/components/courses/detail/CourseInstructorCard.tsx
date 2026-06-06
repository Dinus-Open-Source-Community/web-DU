import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

interface CourseInstructorCardProps {
  name: string
  role: string
  avatar?: string
  desc: string
}

export function CourseInstructorCard({ name, role, avatar, desc }: CourseInstructorCardProps) {
  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
      <h2 className={cn(detailLayout.sectionTitle, 'mb-4')}>Instruktur</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
          {avatar ? (
            <img src={avatar} alt={name} loading="lazy" className="h-full w-full object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
              {name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
          <p className={detailLayout.body}>{desc}</p>
        </div>
      </div>
    </section>
  )
}
