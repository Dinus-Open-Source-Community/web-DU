import { ChartCard } from '@/components/shared/ChartCard'
import ResumeCard from '@/components/shared/ResumeCard'
import FeedbackCard from '@/components/shared/Feedback'
import { PageHeader } from '@/components/shared/Header'
import { StudentKpiGrid } from '@/components/student/dashboard/StudentKpiGrid'
import { StudentQuickLinks } from '@/components/student/dashboard/StudentQuickLinks'
import { isLearningProgressInProgress } from '@/lib/learning/progress'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { gridCardsClassName, gridMainSidebarClassName } from '@/lib/layout/page-layout'
import type { IUserData } from '@/lib/types/user'
import { cn } from '@/lib/utils'

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

      <StudentQuickLinks />

      <ChartCard
        title="Lanjutkan Belajar"
        subtitle="Kursus yang masih berjalan — lanjutkan dari progres terakhir"
        contentClassName="pt-0"
      >
        <div className={cn(gridCardsClassName, 'px-0')}>
          {resumeCourses.length > 0 ? (
            resumeCourses.map((course) => <ResumeCard key={course.uid} data={course} />)
          ) : (
            <div className={cn(studentDashboardLayout.emptyBlock, 'col-span-full')}>
              Belum ada kursus untuk dilanjutkan.
            </div>
          )}
        </div>
      </ChartCard>

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
