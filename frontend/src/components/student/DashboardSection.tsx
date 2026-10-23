import { Link } from 'react-router-dom'

import { ChartCard } from '@/components/shared/ChartCard'
import ResumeCard from '@/components/shared/ResumeCard'
import FeedbackCard from '@/components/shared/Feedback'
import { PageHeader } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { StudentKpiGrid } from '@/components/student/dashboard/StudentKpiGrid'
import { isLearningProgressInProgress } from '@/lib/learning/progress'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { gridCardsClassName, gridMainSidebarClassName } from '@/lib/layout/page-layout'
import { ROUTES } from '@/lib/routes'
import type { IUserData } from '@/lib/types/user'

const feedbackDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

type DashboardSectionProps = {
  Data: IUserData
}

const DashboardSection = ({ Data }: DashboardSectionProps) => {
  const resumeCourses = (Data?.joined_courses ?? []).filter((course) =>
    isLearningProgressInProgress(course.progress),
  )
  const recentFeedback = Data.course_reviews.slice(0, 3).map((review) => ({
    status: (review.rating >= 4 ? 'Lulus' : 'Perlu Revisi') as 'Lulus' | 'Perlu Revisi',
    time: feedbackDateFormatter.format(new Date(review.created_at)),
    title: review.course.title,
    comment: review.comment,
    instructor: {
      name: Data.name,
      avatar: Data.avatar_url || '/Logo.svg',
    },
  }))

  return (
    <>
      <PageHeader
        className={studentDashboardLayout.pageHeader}
        title="Dasbor"
        subtitle={`Halo, ${Data.name}! Siap melanjutkan perjalanan belajarmu hari ini?`}
      />

      <StudentKpiGrid summary={Data.enrollment_summary} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
              Lanjutkan Belajar
            </h2>
            <p className="text-xs font-medium text-ink-500 sm:text-sm">
              Kursus yang masih berjalan — lanjutkan dari progres terakhir
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 shrink-0 rounded-sm border-2 border-ink-900/10 bg-paper-white px-3.5 text-xs font-semibold text-ink-900 shadow-none hover:border-ink-900/30 hover:bg-paper-paper active:scale-[0.98] transition-all"
          >
            <Link to={ROUTES.student.learning}>Semua kursus</Link>
          </Button>
        </div>

        {resumeCourses.length > 0 ? (
          <div className={gridCardsClassName}>
            {resumeCourses.map((course) => (
              <ResumeCard key={course.uid} data={course} />
            ))}
          </div>
        ) : (
          <div className={studentDashboardLayout.emptyBlock}>
            Belum ada kursus untuk dilanjutkan.
          </div>
        )}
      </section>

      <div className={gridMainSidebarClassName}>
        <ChartCard title="Tenggat Waktu" subtitle="Deadline tugas dan pengumpulan mendatang">
          <div className={studentDashboardLayout.emptyBlock}>
            Tidak ada tenggat waktu saat ini.
          </div>
        </ChartCard>

        <ChartCard title="Umpan Balik" subtitle="Ulasan kursus dan catatan terbaru">
          <div className="space-y-3">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((fb, i) => (
                <FeedbackCard
                  key={i}
                  status={fb.status}
                  time={fb.time}
                  title={fb.title}
                  comment={fb.comment}
                  instructor={fb.instructor}
                />
              ))
            ) : (
              <div className={studentDashboardLayout.emptyBlock}>
                Belum ada umpan balik terbaru.
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </>
  )
}

export default DashboardSection
