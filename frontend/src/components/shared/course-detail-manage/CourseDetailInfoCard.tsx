import type { ReactNode } from 'react'
import { Banknote, Layers3, Layout, Star, Tag } from 'lucide-react'

import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { formatCourseRatingLabel, hasPublishedCourseReviews } from '@/lib/course-detail/course-rating'
import { FormatRupiah } from '@/lib/func/func'
import type { ICourseDetailItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

type CourseDetailInfoCardProps = {
  course: ICourseDetailItem
  className?: string
}

type InfoRowProps = {
  icon: ReactNode
  label: string
  value: ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="text-slate-400" aria-hidden>
          {icon}
        </span>
        <span className={manageDetailLayout.sectionLabel}>{label}</span>
      </div>
      <div className="shrink-0 text-right text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}

export function CourseDetailInfoCard({ course, className }: CourseDetailInfoCardProps) {
  const categoryName =
    typeof course.category === 'string' ? course.category : course.category?.name || '-'

  return (
    <aside className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding, className)}>
      <h3 className={cn(manageDetailLayout.sectionTitle, 'mb-4 flex items-center gap-2')}>
        <Layout className="size-4 text-slate-400" aria-hidden />
        Informasi kursus
      </h3>

      <div className="space-y-1">
        <InfoRow
          icon={<Banknote className="size-3.5" />}
          label="Harga"
          value={
            <div className="flex flex-col items-end">
              <span className="text-primary">
                {course.price === 0 ? 'Gratis' : FormatRupiah(course.price)}
              </span>
              {course.price_strike ? (
                <span className="text-[11px] font-medium text-slate-400 line-through">
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
  )
}
