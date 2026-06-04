import type { ReactNode } from 'react'
import { Award, Infinity as InfinityIcon } from 'lucide-react'
import type { ICourseDetailItem, ICourseItem } from '@/lib/types/course'
import { CourseDetailHero } from './detail/detailHero'
import { CourseWhatYouLearn } from './detail/detailWhatYouLearn'
import { CourseInstructorCard } from './detail/CourseInstructorCard'
import { StudentFeedbackPanel } from './detail/StudentPanel'
import { CourseDetailSidebar } from './detail/CourseDetailSidebar'
import { PopularCoursesStrip } from './detail/PopularCourse'
import { FormatRupiah } from '@/lib/func/func'
import CourseUserReviews from './detail/ReviewSection'

interface CourseDetailLayoutProps extends ICourseDetailItem {
  backHref?: string
  backLabel?: string
  totalReviews: number
  sidebarCta: ReactNode
  // syllabus: SyllabusSection[]
  // feedbackBreakdown: FeedbackBreakdown[]
  popularBaseHref?: string
  descriptionContent?: ReactNode
  PopularCourse: ICourseItem[]
}

export function CourseDetailLayout({ data }: { data: CourseDetailLayoutProps }) {
  const includes = [
    {
      icon: <InfinityIcon className="h-4 w-4 text-slate-400" />,
      label: 'Akses selamanya',
    },
    { icon: <Award className="h-4 w-4 text-slate-400" />, label: 'Sertifikat penyelesaian' },
  ]

  const discountLabel = data.price_strike ? `Hemat ${Math.round(((data.price_strike - data.price) / data.price_strike) * 100)}%` : undefined

  return (
    <div className="flex flex-col">
      <CourseDetailHero title={data.title} description={data.description} category={data.category.name} backHref={data.backHref} backLabel={data.backLabel} />

      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            <CourseWhatYouLearn items={data.what_you_learn} />

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-slate-900">{data.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">{data.descriptionContent ?? <p>{data.description}</p>}</div>
            </section>

            <CourseInstructorCard name={data.mentors[0].name} role={data.mentors[0].role} avatar={data.mentors[0].avatar_url} desc={data.mentors[0].description} />

            <StudentFeedbackPanel course={data} />

            <CourseUserReviews reviews={data.reviews ?? []} />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <CourseDetailSidebar
              previewImage={data.cover_url}
              price={FormatRupiah(data.price) as string}
              strikePrice={FormatRupiah(data.price_strike) as string}
              discountLabel={discountLabel}
              includes={includes}>
              {data.sidebarCta}
            </CourseDetailSidebar>
          </div>
        </div>

        <div className="mt-8">
          <PopularCoursesStrip items={data.PopularCourse as ICourseItem[]} />
        </div>
      </div>
    </div>
  )
}
