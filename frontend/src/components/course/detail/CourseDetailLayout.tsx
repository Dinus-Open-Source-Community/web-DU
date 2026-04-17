import type { ReactNode } from 'react'
import { Award, Infinity as InfinityIcon, Monitor } from 'lucide-react'

import { CourseDescription } from '@/components/course/detail/CourseDescription'
import { CourseDetailHero } from '@/components/course/detail/CourseDetailHero'
import { CourseDetailSidebar } from '@/components/course/detail/CourseDetailSidebar'
import { CourseInstructorCard } from '@/components/course/detail/CourseInstructorCard'
import { CourseSyllabusList, type SyllabusSection } from '@/components/course/detail/CourseSyllabusList'
import { CourseWhatYouLearn } from '@/components/course/detail/CourseWhatYouLearn'
import { PopularCoursesStrip, type PopularCourseItem } from '@/components/course/detail/PopularCoursesStrip'
import { StudentFeedbackPanel, type FeedbackBreakdown } from '@/components/course/detail/StudentFeedbackPanel'

interface CourseDetailLayoutProps {
  backHref?: string
  backLabel?: string
  category: string
  title: string
  description: string
  rating: number
  studentsCount: number
  durationLabel?: string
  totalReviews: number
  previewImage?: string
  price: string
  strikePrice?: string
  discountLabel?: string
  sidebarCta: ReactNode
  whatYouLearn: string[]
  syllabus: SyllabusSection[]
  feedbackBreakdown: FeedbackBreakdown[]
  instructor: {
    name: string
    role: string
    avatar?: string
    bio?: string
    studentsCount?: number
    coursesCount?: number
  }
  popularCourses: PopularCourseItem[]
  popularBaseHref?: string
  descriptionContent?: ReactNode
}

export function CourseDetailLayout({
  backHref,
  backLabel,
  category,
  title,
  description,
  rating,
  studentsCount,
  durationLabel,
  totalReviews,
  previewImage,
  price,
  strikePrice,
  discountLabel,
  sidebarCta,
  whatYouLearn,
  syllabus,
  feedbackBreakdown,
  instructor,
  popularCourses,
  popularBaseHref,
  descriptionContent,
}: CourseDetailLayoutProps) {
  const includes = [
    { icon: <Monitor className="h-4 w-4 text-slate-400" />, label: `${durationLabel ?? '—'} on-demand video` },
    {
      icon: <InfinityIcon className="h-4 w-4 text-slate-400" />,
      label: 'Akses selamanya',
    },
    { icon: <Award className="h-4 w-4 text-slate-400" />, label: 'Sertifikat penyelesaian' },
  ]

  return (
    <div className="flex flex-col">
      <CourseDetailHero
        title={title}
        description={description}
        category={category}
        rating={rating}
        studentsCount={studentsCount}
        durationLabel={durationLabel}
        backHref={backHref}
        backLabel={backLabel}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            <CourseWhatYouLearn items={whatYouLearn} />

            <CourseDescription>{descriptionContent ?? <p>{description}</p>}</CourseDescription>

            <CourseSyllabusList sections={syllabus} />

            <CourseInstructorCard
              name={instructor.name}
              role={instructor.role}
              avatar={instructor.avatar}
              bio={instructor.bio}
              studentsCount={instructor.studentsCount}
              coursesCount={instructor.coursesCount}
            />

            <StudentFeedbackPanel rating={rating} totalReviews={totalReviews} breakdown={feedbackBreakdown} />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <CourseDetailSidebar previewImage={previewImage} price={price} strikePrice={strikePrice} discountLabel={discountLabel} includes={includes}>
              {sidebarCta}
            </CourseDetailSidebar>
          </div>
        </div>

        <div className="mt-8">
          <PopularCoursesStrip items={popularCourses} baseHref={popularBaseHref} />
        </div>
      </div>
    </div>
  )
}
