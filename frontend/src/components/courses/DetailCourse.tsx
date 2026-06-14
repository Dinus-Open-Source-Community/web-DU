import type { ReactNode } from 'react'
import { Award, Infinity as InfinityIcon } from 'lucide-react'

import type { ICourseDetailItem, ICourseItem } from '@/lib/types/course'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import { resolveCourseProfile } from '@/lib/course-detail/course-profile'
import { buildDiscountLabel } from '@/lib/course-detail/pricing'
import { FormatRupiah } from '@/lib/func/func'
import { cn } from '@/lib/utils'
import { CourseDetailHero } from './detail/detailHero'
import { CourseWhatYouLearn } from './detail/detailWhatYouLearn'
import { CourseInstructorCard } from './detail/CourseInstructorCard'
import { StudentFeedbackPanel } from './detail/StudentPanel'
import { CourseDetailSidebar } from './detail/CourseDetailSidebar'
import { CourseDetailMobileCta } from './detail/CourseDetailMobileCta'
import { CourseDetailMobileSummary } from './detail/CourseDetailMobileSummary'
import { PopularCoursesStrip } from './detail/PopularCourse'
import CourseUserReviews from './detail/ReviewSection'

interface CourseDetailLayoutProps extends ICourseDetailItem {
  backHref?: string
  backLabel?: string
  totalReviews: number
  sidebarCta: ReactNode
  popularBaseHref?: string
  descriptionContent?: ReactNode
  PopularCourse: ICourseItem[]
}

function buildCourseIncludes() {
  return [
    {
      icon: <InfinityIcon className="h-4 w-4 text-slate-400" aria-hidden />,
      label: 'Akses selamanya',
    },
    {
      icon: <Award className="h-4 w-4 text-slate-400" aria-hidden />,
      label: 'Sertifikat penyelesaian',
    },
  ]
}

export function CourseDetailLayout({ data }: { data: CourseDetailLayoutProps }) {
  const formattedPrice = FormatRupiah(data.price) as string
  const formattedStrikePrice = data.price_strike ? (FormatRupiah(data.price_strike) as string) : undefined
  const discountLabel = buildDiscountLabel(data.price, data.price_strike)
  const includes = buildCourseIncludes()
  const totalReviews = data.totalReviews || data.reviews?.length || 0
  const instructor = resolveCourseProfile(data)

  return (
    <div className="flex flex-col pt-16">
      <CourseDetailHero
        title={data.title}
        description={data.description}
        category={data.category.name}
        backHref={data.backHref}
        backLabel={data.backLabel}
      />

      <div
        className={cn(
          detailLayout.page,
          detailLayout.pageGutter,
          detailLayout.pageSection,
          detailLayout.pageBottomMobile,
        )}
      >
        <CourseDetailMobileSummary
          previewImage={data.cover_url}
          price={formattedPrice}
          strikePrice={formattedStrikePrice}
          discountLabel={discountLabel}
          rating={data.rating}
          totalReviews={totalReviews}
        />

        <div className={cn(detailLayout.mainGrid, 'mt-4 sm:mt-6')}>
          <div className={detailLayout.contentStack}>
            <CourseWhatYouLearn items={data.what_you_learn} />

            <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding)}>
              <h2 className={cn(detailLayout.sectionTitle, 'mb-3')}>Tentang kursus ini</h2>
              <div className={cn(detailLayout.body, 'space-y-3')}>
                {data.descriptionContent ?? <p>{data.description}</p>}
              </div>
            </section>

            {instructor ? (
              <CourseInstructorCard
                name={instructor.name}
                role={instructor.role ?? 'Instruktur'}
                avatar={instructor.avatar_url}
                desc={instructor.description ?? ''}
              />
            ) : null}

            <StudentFeedbackPanel course={data} />

            <CourseUserReviews reviews={data.reviews ?? []} />
          </div>

          <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <CourseDetailSidebar
              previewImage={data.cover_url}
              price={formattedPrice}
              strikePrice={formattedStrikePrice}
              discountLabel={discountLabel}
              includes={includes}
            >
              {data.sidebarCta}
            </CourseDetailSidebar>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <PopularCoursesStrip items={data.PopularCourse as ICourseItem[]} />
        </div>
      </div>

      <CourseDetailMobileCta
        price={formattedPrice}
        strikePrice={formattedStrikePrice}
        discountLabel={discountLabel}
      >
        {data.sidebarCta}
      </CourseDetailMobileCta>
    </div>
  )
}
