import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShoppingCart, Zap } from 'lucide-react'

import GuestLayout from '@/components/layout/GuestLayout'
import { CourseDetailLayout } from '@/components/course/detail/CourseDetailLayout'
import { Button } from '@/components/ui/button'
import {
  adminCourseFeedbackBreakdown,
  adminCourseSyllabus,
  adminCourseWhatYouLearn,
  adminCourses,
  adminMentors,
  popularCoursesStrip,
} from '@/lib/data/admin-fixtures'
import { formatRupiah } from '@/lib/func'

export const metadata: Metadata = {
  title: 'Detail Kursus — Doscom University',
}

interface PageProps {
  params: Promise<{ uid: string }>
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { uid } = await params
  const course = adminCourses.find((c) => c.uid === uid)
  if (!course) notFound()

  const mentor = adminMentors.find((m) => m.uid === course.mentorUid)

  const discountLabel = course.strikePrice
    ? `Hemat ${Math.round(((course.strikePrice - course.price) / course.strikePrice) * 100)}%`
    : undefined

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseDetailLayout
          backHref="/course"
          backLabel="Kembali ke Katalog"
          category={course.category}
          title={course.title}
          description={course.description}
          rating={course.rating}
          studentsCount={course.enrolled}
          totalReviews={course.reviews}
          durationLabel={course.duration}
          previewImage={course.image}
          price={course.price === 0 ? 'Gratis' : formatRupiah(course.price)}
          strikePrice={course.strikePrice ? formatRupiah(course.strikePrice) : undefined}
          discountLabel={discountLabel}
          whatYouLearn={adminCourseWhatYouLearn}
          syllabus={adminCourseSyllabus}
          feedbackBreakdown={adminCourseFeedbackBreakdown}
          instructor={{
            name: course.mentorName,
            role: mentor?.specializations.join(', ') ?? 'Mentor',
            avatar: course.mentorAvatar,
            bio: mentor?.bio,
            studentsCount: mentor?.studentsCount,
            coursesCount: mentor?.totalCourses,
          }}
          popularCourses={popularCoursesStrip}
          popularBaseHref="/course"
          sidebarCta={
            <>
              <Button className="h-11 rounded-xl text-sm font-semibold">
                <Zap className="mr-1.5 h-4 w-4" aria-hidden />
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden />
                Add to Cart
              </Button>
            </>
          }
        />
      </GuestLayout>
    </main>
  )
}
