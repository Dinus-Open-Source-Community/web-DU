import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import GuestLayout from '@/components/layout/GuestLayout'
import { CourseDetailLayout } from '@/components/course/detail/CourseDetailLayout'
import { Button } from '@/components/ui/button'
import { listCourses, listMentors, getCourseFeedbackBreakdown, getCourseWhatYouLearn, getSyllabusFromCourse } from '@/lib/data/repository'
import { getCurrentUser, type UserRole } from '@/lib/data/dummyUsers'
import { formatRupiah, slugify } from '@/lib/func'
import Link from 'next/link'

const PRIVILEGED_ROLES: UserRole[] = ['mentor', 'admin']

export const metadata: Metadata = {
  title: 'Detail Kursus — Doscom University',
}

interface PageProps {
  params: Promise<{ uid: string }>
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { uid } = await params
  const courses = listCourses()
  const course = courses.find((c) => c.uid === uid)
  if (!course) notFound()

  const mentors = listMentors()
  const mentor = mentors.find((m) => m.uid === course.mentorUid)

  const viewer = getCurrentUser()
  const canManageCourse = PRIVILEGED_ROLES.includes(viewer.role)

  const discountLabel = course.strikePrice ? `Hemat ${Math.round(((course.strikePrice - course.price) / course.strikePrice) * 100)}%` : undefined
  const courseSlug = slugify(course.title)

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseDetailLayout
          backHref="/course"
          backLabel="Kembali ke Katalog"
          category={course.category ?? ''}
          title={course.title}
          description={course.description}
          rating={course.rating}
          studentsCount={course.enrolled}
          totalReviews={course.totalReviews}
          durationLabel={course.duration}
          previewImage={course.image}
          price={course.price === 0 ? 'Gratis' : formatRupiah(course.price)}
          strikePrice={course.strikePrice ? formatRupiah(course.strikePrice) : undefined}
          discountLabel={discountLabel}
          whatYouLearn={getCourseWhatYouLearn()}
          syllabus={getSyllabusFromCourse(course)}
          feedbackBreakdown={getCourseFeedbackBreakdown()}
          instructor={{
            name: course.author.name,
            role: mentor?.specializations.join(', ') ?? 'Mentor',
            avatar: course.author.avatar,
            bio: mentor?.bio,
            studentsCount: mentor?.studentsCount,
            coursesCount: mentor?.totalCourses,
          }}
          popularCourses={[]}
          popularBaseHref="/course"
          sidebarCta={
            canManageCourse ? (
              <>
                <Button className="h-11 rounded-xl text-sm font-semibold">
                  <Link href={`/course/${uid}/view`}>Lihat Materi</Link>
                </Button>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50">
                  Edit Detail Kursus
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="h-11 rounded-xl text-sm font-semibold">
                  <Link href={`/checkout/${courseSlug}`}>Beli Sekarang</Link>
                </Button>
              </>
            )
          }
        />
      </GuestLayout>
    </main>
  )
}
