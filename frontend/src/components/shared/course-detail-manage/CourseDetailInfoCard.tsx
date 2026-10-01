import type { ReactNode } from 'react'
import { Banknote, BadgeCheck, GraduationCap, Layers3, Layout, Star, Tag } from 'lucide-react'

import { AdminPublishStatusLabel } from '@/lib/admin/status-label'
import { apiLevelToUi } from '@/lib/course-form/level'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { formatCourseRatingLabel, hasPublishedCourseReviews } from '@/lib/course-detail/course-rating'
import { FormatRupiah } from '@/lib/func/func'
import type { ICourseDetailItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

type CourseDetailInfoCardProps = {
  course: ICourseDetailItem
  isPublished: boolean
  className?: string
}

type InfoRowProps = {
  icon: ReactNode
  label: string
  value: ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 border-b border-line-light py-2 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-ink-400" aria-hidden>
          {icon}
        </span>
        <span className="text-xs font-medium text-ink-500">{label}</span>
      </div>
      <div className="min-w-0 text-right text-xs font-semibold text-ink-900 [&_.inline-flex]:font-semibold [&_span]:text-xs">
        {value}
      </div>
    </div>
  )
}

export function CourseDetailInfoCard({
  course,
  isPublished,
  className,
}: CourseDetailInfoCardProps) {
  const categoryName =
    typeof course.category === 'string' ? course.category : course.category?.name || '-'

  return (
    <div className={cn(manageDetailLayout.overviewInfoCardShell, className)}>
      <aside
        className={cn(
          manageDetailLayout.overviewInfoCardInner,
          manageDetailLayout.overviewInfoCardScroll,
          manageDetailLayout.overviewInfoCardPadding,
        )}
      >
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight text-ink-900">
          <Layout className="size-3.5 text-ink-400" aria-hidden />
          Informasi kursus
        </h3>

        <div>
          <InfoRow
            icon={<BadgeCheck className="size-3.5" />}
            label="Status"
            value={<AdminPublishStatusLabel published={isPublished} />}
          />

          <InfoRow
            icon={<GraduationCap className="size-3.5" />}
            label="Level"
            value={apiLevelToUi(course.level)}
          />

          <InfoRow
            icon={<Banknote className="size-3.5" />}
            label="Harga"
            value={
              <div className="flex flex-col items-end">
                <span className="text-primary">
                  {course.price === 0 ? 'Gratis' : FormatRupiah(course.price)}
                </span>
                {course.price_strike ? (
                  <span className="text-[10px] font-medium text-ink-400 line-through">
                    {FormatRupiah(course.price_strike)}
                  </span>
                ) : null}
              </div>
            }
          />

          <InfoRow
            icon={<Tag className="size-3.5" />}
            label="Tipe"
            value={course.course_type?.name || 'Reguler'}
          />

          <InfoRow icon={<Layers3 className="size-3.5" />} label="Kategori" value={categoryName} />

          <InfoRow
            icon={<Star className="size-3.5 text-amber-400" />}
            label="Rating"
            value={
              hasPublishedCourseReviews(course.total_reviews)
                ? formatCourseRatingLabel(course.rating)
                : 'Belum ada ulasan'
            }
          />
        </div>
      </aside>
    </div>
  )
}
