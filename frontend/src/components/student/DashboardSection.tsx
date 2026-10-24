import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { ChartCard } from '@/components/shared/ChartCard'
import ResumeCard from '@/components/shared/ResumeCard'
import FeedbackCard from '@/components/shared/Feedback'
import { PageHeader } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { StudentKpiGrid } from '@/components/student/dashboard/StudentKpiGrid'
import { PublicLottieIllustration } from '@/components/playful/PublicLottieIllustration'
import { appToolbarPrimaryButtonClassName } from '@/lib/design/app-shell-tokens'
import {
  isLearningProgressInProgress,
  toLearningProgressPercent,
} from '@/lib/learning/progress'
import { studentDashboardLayout } from '@/lib/layout/student-dashboard-layout'
import { gridCardsClassName, gridMainSidebarClassName } from '@/lib/layout/page-layout'
import { ROUTES } from '@/lib/routes'
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
  const resumeCourses = useMemo(() => {
    return (Data?.joined_courses ?? [])
      .filter((course) => isLearningProgressInProgress(course.progress))
      .sort((a, b) => {
        const diff =
          toLearningProgressPercent(a.progress) -
          toLearningProgressPercent(b.progress)
        if (diff !== 0) return diff
        return (a.title ?? '').localeCompare(b.title ?? '')
      })
      .slice(0, 3)
  }, [Data?.joined_courses])
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

      <section className="flex flex-col gap-4 rounded-xl border-2 border-ink-900/10 bg-paper-white p-5 sm:p-6 shadow-paper">
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
            variant="default"
            size="default"
            className={cn(appToolbarPrimaryButtonClassName, 'shrink-0 self-start')}
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PublicLottieIllustration
              src="/lotties/nothing.json"
              height="180px"
              maxWidthClassName="max-w-[12rem] sm:max-w-[14rem]"
              className="mb-2"
            />
            <p className="text-sm font-medium text-ink-500">
              Belum ada kursus untuk dilanjutkan.
            </p>
          </div>
        )}
      </section>

      <div className={gridMainSidebarClassName}>
        <ChartCard title="Tenggat Waktu" subtitle="Deadline tugas dan pengumpulan mendatang">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <PublicLottieIllustration
              src="/lotties/calm-duedate-task.json"
              height="160px"
              maxWidthClassName="max-w-[11rem] sm:max-w-[13rem]"
              className="mb-2"
            />
            <p className="text-sm font-medium text-ink-500">
              Tidak ada tenggat waktu saat ini.
            </p>
          </div>
        </ChartCard>

        <ChartCard title="Umpan Balik" subtitle="Ulasan kursus dan catatan terbaru">
          {recentFeedback.length > 0 ? (
            <div className="space-y-3">
              {recentFeedback.map((fb, i) => (
                <FeedbackCard
                  key={i}
                  status={fb.status}
                  time={fb.time}
                  title={fb.title}
                  comment={fb.comment}
                  instructor={fb.instructor}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <PublicLottieIllustration
                src="/lotties/review.json"
                height="160px"
                maxWidthClassName="max-w-[11rem] sm:max-w-[13rem]"
                className="mb-2"
              />
              <p className="text-sm font-medium text-ink-500">
                Belum ada umpan balik terbaru.
              </p>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  )
}

export default DashboardSection
