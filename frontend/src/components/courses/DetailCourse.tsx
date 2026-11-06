import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ICourseDetailItem, ICourseItem } from '@/lib/types/course'
import { resolveCourseProfiles } from '@/lib/course-detail/course-profile'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { ROUTES } from '@/lib/routes'
import { CourseAboutAndLearn } from './detail/CourseAboutAndLearn'
import { CourseInstructorCard } from './detail/CourseInstructorCard'
import { CourseUnifiedReviewHub } from './detail/ReviewSection'
import { CourseDetailSidebar } from './detail/CourseDetailSidebar'
import { PopularCoursesStrip } from './detail/PopularCourse'

interface CourseDetailLayoutProps extends ICourseDetailItem {
  backHref?: string
  backLabel?: string
  totalReviews: number
  sidebarCta: ReactNode
  popularBaseHref?: string
  descriptionContent?: ReactNode
  PopularCourse: ICourseItem[]
  isEnrolled?: boolean
}

export function CourseDetailLayout({ data }: { data: CourseDetailLayoutProps }) {
  const instructors = resolveCourseProfiles(data)
  const totalReviews = data.totalReviews || data.reviews?.length || 0

  const categoryName =
    typeof data.category === 'object' && data.category !== null
      ? data.category.name
      : String(data.category ?? '')

  const courseTypeName =
    typeof data.course_type === 'object' && data.course_type !== null
      ? data.course_type.name
      : typeof data.course_type === 'string'
        ? data.course_type
        : undefined

  const popularCoursesList = (data.PopularCourse ?? []) as ICourseItem[]

  const sidebarProps = {
    title: data.title,
    description: data.description,
    category: categoryName,
    courseType: courseTypeName,
    level: data.level,
    isEnrolled: data.isEnrolled,
    previewImage: data.cover_url,
    slot: data.slot,
  }

  return (
    <div className="relative z-1 mx-auto w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-8">
      {/* Top Nav: Back button */}
      <div className="mb-6">
        <Link to={data.backHref ?? ROUTES.courses} className={detailLayout.backLink}>
          <ArrowLeft className="size-4 shrink-0 text-ink-900" aria-hidden />
          <span>{data.backLabel ?? 'Kembali ke katalog'}</span>
        </Link>
      </div>

      {/* Main Split-Hero Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-10 items-start">
        {/* Left Column: Content Sections */}
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Mobile Preview & CTA Card (Shown on small screens) */}
          <div className="lg:hidden">
            <CourseDetailSidebar {...sidebarProps}>
              {data.sidebarCta}
            </CourseDetailSidebar>
          </div>

          {/* Section 1: Tentang Kursus & Yang Akan Kamu Pelajari */}
          <CourseAboutAndLearn
            description={data.description}
            descriptionContent={data.descriptionContent}
            items={data.what_you_learn}
          />

          {/* Section 2: Instruktur Kursus */}
          {instructors.map((instructor) => (
            <CourseInstructorCard
              key={instructor.uid ?? instructor.name}
              name={instructor.name}
              role={instructor.role ?? 'Instruktur'}
              avatar={instructor.avatar_url}
            />
          ))}

          {/* Section 3: Penilaian & Ulasan Terpadu */}
          <CourseUnifiedReviewHub
            rating={data.rating}
            totalReviews={totalReviews}
            reviews={data.reviews ?? []}
          />

          {/* Mobile Kursus Populer (Tampil di bagian bawah pada layar mobile) */}
          {popularCoursesList.length > 0 && (
            <div className="lg:hidden">
              <PopularCoursesStrip items={popularCoursesList} />
            </div>
          )}
        </div>

        {/* Right Column: Action Card + Kursus Populer di Bawahnya pada Desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-8 lg:self-start">
          <CourseDetailSidebar {...sidebarProps}>
            {data.sidebarCta}
          </CourseDetailSidebar>

          {popularCoursesList.length > 0 && (
            <PopularCoursesStrip
              items={popularCoursesList}
              isSidebar
              itemsPerPage={2}
            />
          )}
        </div>
      </div>
    </div>
  )
}
