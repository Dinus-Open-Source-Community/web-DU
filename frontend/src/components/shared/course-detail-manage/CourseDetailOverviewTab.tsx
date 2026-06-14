import { FileText, Layers3, UsersRound } from 'lucide-react'

import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { ICourseDetailItem, IMentorCourseStudent } from '@/lib/types/course'
import { cn } from '@/lib/utils'

import { CourseDetailInfoCard } from './CourseDetailInfoCard'

type CourseDetailOverviewTabProps = {
  course: ICourseDetailItem
  students: IMentorCourseStudent[]
}

export function CourseDetailOverviewTab({ course, students }: CourseDetailOverviewTabProps) {
  const moduleCount = course.modules?.length || 0

  return (
    <div className={manageDetailLayout.overviewGrid}>
      <CourseDetailInfoCard course={course} className="lg:order-2" />

      <div className="flex flex-col gap-6 sm:gap-8 lg:order-1">
        <div className={manageDetailLayout.statGrid}>
          <div className={manageDetailLayout.statCard}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UsersRound className="size-4 text-primary" aria-hidden />
              {students.length}
            </div>
            <p className={cn(manageDetailLayout.meta, 'mt-1')}>Peserta</p>
          </div>

          <div className={manageDetailLayout.statCard}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Layers3 className="size-4 text-primary" aria-hidden />
              {moduleCount}
            </div>
            <p className={cn(manageDetailLayout.meta, 'mt-1')}>Modul</p>
          </div>
        </div>

        <article className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding)}>
          <h3 className={cn(manageDetailLayout.sectionTitle, 'mb-4 flex items-center gap-2')}>
            <FileText className="size-4 text-slate-400" aria-hidden />
            Tentang kursus
          </h3>
          <div
            className={cn(manageDetailLayout.body, 'prose prose-slate max-w-none')}
            dangerouslySetInnerHTML={{
              __html:
                course.description ||
                '<p class="italic text-slate-400">Belum ada deskripsi.</p>',
            }}
          />
        </article>
      </div>
    </div>
  )
}
