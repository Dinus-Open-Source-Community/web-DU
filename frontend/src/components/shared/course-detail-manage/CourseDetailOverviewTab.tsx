import type { ReactNode } from 'react'
import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  MessageSquareText,
  UsersRound,
} from 'lucide-react'

import { CourseDetailOverviewSection } from '@/components/shared/course-detail-manage/CourseDetailOverviewSection'
import { SanitizedHtml } from '@/components/shared/SanitizedHtml'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCourseDetailOverviewAssignments } from '@/hooks/course-detail/use-course-detail-overview'
import {
  countCurriculumLessons,
  COURSE_DETAIL_OVERVIEW_REVIEW_KPI_LABEL,
  summarizeAssignments,
  summarizeCourseReviews,
} from '@/lib/course-detail/course-detail-overview-stats'
import { deriveLessonsFromModules } from '@/lib/course-detail/derive-lessons-from-modules'
import { formatCourseRatingLabel, hasPublishedCourseReviews } from '@/lib/course-detail/course-rating'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { Initials } from '@/lib/func/func'
import type { ICourseDetailItem, IMentorCourseStudent, IModulesData } from '@/lib/types/course'
import { cn } from '@/lib/utils'

import type { CourseDetailTabValue } from './CourseDetailNavTabs'
import { CourseDetailInfoCard } from './CourseDetailInfoCard'
import { CourseDetailTabSectionIntro } from './CourseDetailTabSectionIntro'
import { StatCard } from '@/components/shared/StatCard'

const OVERVIEW_KPI_ACCENTS = [
  'border-l-brand-blue',
  'border-l-[#A8EFCF]',
  'border-l-[#D7CBFF]',
  'border-l-[#FFC4A6]',
  'border-l-note-yellow',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-[#B8D4FF]',
] as const

type CourseDetailOverviewTabProps = {
  course: ICourseDetailItem
  modules: IModulesData[]
  courseUid: string
  students: IMentorCourseStudent[]
  isAdmin: boolean
  isPublished: boolean
  overviewDataEnabled: boolean
  onNavigateToTab: (tab: CourseDetailTabValue) => void
}

type StatItemProps = {
  label: string
  value: string | number
  accentClassName?: string
}

function StatItem({ label, value, accentClassName }: StatItemProps) {
  return (
    <StatCard
      variant="kpi"
      label={label}
      value={value}
      accentClassName={accentClassName}
      className="h-full"
    />
  )
}

function OverviewEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-500">{children}</p>
}

export function CourseDetailOverviewTab({
  course,
  modules,
  courseUid,
  students,
  isAdmin,
  isPublished,
  overviewDataEnabled,
  onNavigateToTab,
}: CourseDetailOverviewTabProps) {
  const moduleCount = modules.length
  const lessonCount = countCurriculumLessons(modules)
  const attendanceLessonCount = deriveLessonsFromModules(modules).length
  const mentors = course.mentors ?? []
  const reviews = course.reviews ?? []

  const reviewSummary = summarizeCourseReviews(reviews)
  const { assignments, isLoading: assignmentsLoading } = useCourseDetailOverviewAssignments(
    courseUid,
    overviewDataEnabled,
  )
  const assignmentSummary = summarizeAssignments(assignments, students.length)

  const ratingLabel = hasPublishedCourseReviews(course.total_reviews)
    ? formatCourseRatingLabel(course.rating)
    : '—'

  const previewModules = modules.slice(0, 4)
  const previewAssignments = assignments.slice(0, 4)
  const previewStudents = students.slice(0, 6)

  let kpiAccentIndex = 0
  const nextAccent = () =>
    OVERVIEW_KPI_ACCENTS[kpiAccentIndex++ % OVERVIEW_KPI_ACCENTS.length]!

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <CourseDetailTabSectionIntro
        icon={LayoutDashboard}
        title="Ringkasan kursus"
        description="Lihat statistik singkat, deskripsi, dan cuplikan aktivitas kursus ini."
      />

      <div className={manageDetailLayout.overviewGrid}>
      <div className={cn('lg:order-2', manageDetailLayout.overviewInfoSticky)}>
        <CourseDetailInfoCard course={course} isPublished={isPublished} />
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 lg:order-1">
        <div className={manageDetailLayout.statGrid}>
          <StatItem label="Peserta" value={students.length} accentClassName={nextAccent()} />
          <StatItem label="Modul" value={moduleCount} accentClassName={nextAccent()} />
          <StatItem label="Lesson" value={lessonCount} accentClassName={nextAccent()} />
          <StatItem
            label="Tugas"
            value={assignmentsLoading ? '…' : assignmentSummary.assignmentCount}
            accentClassName={nextAccent()}
          />
          <StatItem
            label={COURSE_DETAIL_OVERVIEW_REVIEW_KPI_LABEL}
            value={reviewSummary.count}
            accentClassName={nextAccent()}
          />
          {isAdmin ? (
            <StatItem label="Mentor" value={mentors.length} accentClassName={nextAccent()} />
          ) : null}
          {isAdmin ? (
            <StatItem label="Lesson absen" value={attendanceLessonCount} accentClassName={nextAccent()} />
          ) : null}
          <StatItem label="Rating publik" value={ratingLabel} accentClassName={nextAccent()} />
        </div>

        <article className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding)}>
          <h3 className={cn(manageDetailLayout.sectionTitle, 'mb-4 flex items-center gap-2')}>
            <FileText className="size-4 text-ink-400" aria-hidden />
            Tentang kursus
          </h3>
          <SanitizedHtml
            html={course.description || '<p class="italic text-ink-400">Belum ada deskripsi.</p>'}
            className={cn(manageDetailLayout.body, 'prose prose-slate max-w-none')}
          />
        </article>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseDetailOverviewSection
            title="Kurikulum"
            description="Ringkasan modul dan lesson dari tab Kurikulum."
            icon={Layers3}
            tab="kurikulum"
            tabLabel="Buka kurikulum"
            onNavigateToTab={onNavigateToTab}
          >
            {moduleCount === 0 ? (
              <OverviewEmpty>Belum ada modul. Susun kurikulum di tab Kurikulum.</OverviewEmpty>
            ) : (
              <ul className="divide-y divide-line-light">
                {previewModules.map((module) => (
                  <li key={module.uid} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{module.title}</p>
                      <p className="text-xs text-ink-500">
                        {module.lessons?.length ?? 0} lesson
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {moduleCount > previewModules.length ? (
              <p className="mt-2 text-xs font-medium text-ink-500">
                +{moduleCount - previewModules.length} modul lainnya
              </p>
            ) : null}
          </CourseDetailOverviewSection>

          <CourseDetailOverviewSection
            title="Tugas"
            description="Tugas lesson dan aktivitas pengumpulan dari tab Tugas."
            icon={ClipboardList}
            tab="assignments"
            tabLabel="Buka tugas"
            onNavigateToTab={onNavigateToTab}
          >
            {assignmentsLoading ? (
              <OverviewEmpty>Memuat data tugas…</OverviewEmpty>
            ) : assignmentSummary.assignmentCount === 0 ? (
              <OverviewEmpty>Belum ada tugas terdaftar untuk kursus ini.</OverviewEmpty>
            ) : (
              <>
                <p className="mb-3 text-xs font-medium text-ink-500">
                  {assignmentSummary.totalSubmissions} pengumpulan ·{' '}
                  {assignmentSummary.completionRate}% dari kuota peserta
                </p>
                <ul className="divide-y divide-line-light">
                  {previewAssignments.map((assignment) => (
                    <li key={assignment.lessonUid} className="py-3 first:pt-0">
                      <p className="text-sm font-semibold text-ink-900">{assignment.title}</p>
                      <p className="text-xs text-ink-500">
                        {assignment.moduleTitle} · {assignment.submissionCount}/{students.length} terkumpul
                      </p>
                    </li>
                  ))}
                </ul>
                {assignmentSummary.assignmentCount > previewAssignments.length ? (
                  <p className="mt-2 text-xs font-medium text-ink-500">
                    +{assignmentSummary.assignmentCount - previewAssignments.length} tugas lainnya
                  </p>
                ) : null}
              </>
            )}
          </CourseDetailOverviewSection>
        </div>

        <CourseDetailOverviewSection
          title="Peserta"
          description="Ringkasan enrollment dan progres dari tab Peserta."
          icon={UsersRound}
          tab="peserta"
          tabLabel="Lihat semua peserta"
          onNavigateToTab={onNavigateToTab}
        >
          {students.length === 0 ? (
            <OverviewEmpty>Belum ada peserta yang terdaftar.</OverviewEmpty>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {previewStudents.map((student) => (
                <li
                  key={student.enrollment_uid}
                  className="flex items-center gap-3 rounded-xl border border-line-light bg-paper-paper/60 px-3 py-2.5"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={student.student_avatar_url} alt={student.student_name} />
                    <AvatarFallback className="text-xs font-semibold">
                      {Initials(student.student_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{student.student_name}</p>
                    <p className="text-xs font-medium text-ink-500 tabular-nums">
                      Progres {Math.round(student.progress ?? 0)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {students.length > previewStudents.length ? (
            <p className="mt-3 text-xs font-medium text-ink-500">
              +{students.length - previewStudents.length} peserta lainnya
            </p>
          ) : null}
        </CourseDetailOverviewSection>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseDetailOverviewSection
            title={COURSE_DETAIL_OVERVIEW_REVIEW_KPI_LABEL}
            description="Umpan balik siswa dari tab Ulasan."
            icon={MessageSquareText}
            tab="review"
            tabLabel="Buka ulasan"
            onNavigateToTab={onNavigateToTab}
          >
            {reviewSummary.count === 0 ? (
              <OverviewEmpty>Belum ada ulasan untuk kursus ini.</OverviewEmpty>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-600">
                  Rata-rata internal{' '}
                  <span className="font-semibold text-ink-900 tabular-nums">
                    {reviewSummary.averageRating.toFixed(1)}
                  </span>
                  /5 · {reviewSummary.pendingReplyCount} belum dibalas
                </p>
                {reviewSummary.latestReview ? (
                  <blockquote className="rounded-xl border border-line-light bg-paper-paper/80 px-3 py-2.5 text-sm text-ink-700">
                    <p className="line-clamp-3">{reviewSummary.latestReview.comment}</p>
                    <footer className="mt-2 text-xs font-medium text-ink-500">
                      {reviewSummary.latestReview.user?.name ?? 'Siswa'} ·{' '}
                      {reviewSummary.latestReview.rating}/5
                    </footer>
                  </blockquote>
                ) : null}
              </div>
            )}
          </CourseDetailOverviewSection>

          {isAdmin ? (
            <CourseDetailOverviewSection
              title="Mentor"
              description="Penugasan mentor dari tab Mentor."
              icon={GraduationCap}
              tab="mentor"
              tabLabel="Kelola mentor"
              onNavigateToTab={onNavigateToTab}
            >
              {mentors.length === 0 ? (
                <OverviewEmpty>Belum ada mentor yang ditugaskan.</OverviewEmpty>
              ) : (
                <ul className="divide-y divide-line-light">
                  {mentors.slice(0, 5).map((mentor) => (
                    <li key={mentor.uid} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{mentor.name}</p>
                        <p className="truncate text-xs text-ink-500">{mentor.email}</p>
                      </div>
                      {mentor.role ? (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink-400">
                          {mentor.role}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CourseDetailOverviewSection>
          ) : null}

          {isAdmin ? (
            <CourseDetailOverviewSection
              title="Kehadiran"
              description="Pencatatan absensi per lesson dari tab Kehadiran."
              icon={ClipboardCheck}
              tab="attendance"
              tabLabel="Buka kehadiran"
              onNavigateToTab={onNavigateToTab}
              className={isAdmin ? undefined : 'hidden'}
            >
              {attendanceLessonCount === 0 ? (
                <OverviewEmpty>Tambahkan lesson di kurikulum untuk mulai mencatat kehadiran.</OverviewEmpty>
              ) : (
                <p className="text-sm text-ink-600">
                  <span className="font-semibold text-ink-900 tabular-nums">{attendanceLessonCount}</span>{' '}
                  lesson siap dicatat kehadirannya untuk{' '}
                  <span className="font-semibold text-ink-900 tabular-nums">{students.length}</span> peserta.
                </p>
              )}
            </CourseDetailOverviewSection>
          ) : null}
        </div>
      </div>
    </div>
    </div>
  )
}
