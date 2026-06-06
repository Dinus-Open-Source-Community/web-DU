import { useState } from 'react'
import { Layers3, UsersRound, LayoutDashboard, Star } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { buildCourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { courseKeys } from '@/hooks/query-keys'
import { useUpdateCourseStatus } from '@/hooks/use-course-mutations'
import { EditCourseDialog } from '@/components/shared/course-form/EditCourseDialog'
import type { ICourseDetailItem, IMentorCourseStudent, IModulesData } from '../../lib/types/course'
import { ROUTES } from '../../lib/routes.ts'
import { cn } from '../../lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ConfirmDialog } from './ConfirmDialog'
import { CourseParticipantsSection } from './CourseParticipation'
import { AssignCourseMentorDialog } from './AssignCourseMentorDialog'
import { CourseMentorTable } from './CourseMentorTable'
import { CourseReviewSection } from './CourseReviewSection'
import { CourseCurriculumTab } from './CourseCurriculumTab'
import { CourseDetailManageHeader } from './course-detail-manage/CourseDetailManageHeader'
import { CourseDetailMobileActions } from './course-detail-manage/CourseDetailMobileActions'
import { CourseDetailOverviewTab } from './course-detail-manage/CourseDetailOverviewTab'

type CourseDetailProps = {
  courseUid: string
  dataCourse: ICourseDetailItem | ICourseDetailItem[] | null
  dataStudents: IMentorCourseStudent[]
  dataModules?: IModulesData[]
  role?: 'mentor' | 'admin'
}

const DETAIL_TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'kurikulum', label: 'Kurikulum', icon: Layers3 },
  { value: 'peserta', label: 'Peserta', icon: UsersRound },
  { value: 'review', label: 'Review', icon: Star },
  { value: 'mentor', label: 'Mentor', icon: UsersRound },
] as const

export function DetailCourse({
  courseUid,
  role = 'mentor',
  dataCourse,
  dataStudents,
  dataModules,
}: CourseDetailProps) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const updateCourseStatus = useUpdateCourseStatus()
  const isAdmin = role === 'admin'
  const [isConfirm, setIsConfirm] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const course = Array.isArray(dataCourse) ? dataCourse[0] : dataCourse

  if (!course) return null

  const isPublished = isCoursePublished(course)
  const editHref = isAdmin
    ? ROUTES.admin.courseEditAdmin(courseUid)
    : ROUTES.mentor.courseEditMentor(courseUid)
  const previewHref = ROUTES.viewModuleAndLessons(courseUid)
  const curriculumEditNavigationState = buildCourseEditNavigationState(location)
  const modules = dataModules ?? course.modules ?? []

  const handleReplyReview = (reviewUid: string, comment: string) => {
    console.log(`Replying to review ${reviewUid}: ${comment}`)
  }

  const handleConfirmStatusUpdate = async () => {
    try {
      await updateCourseStatus.mutateAsync({ courseUid })
      setIsConfirm(false)
    } catch {
      // Error toast ditangani oleh mutation hook.
    }
  }

  return (
    <div className={cn(manageDetailLayout.page, manageDetailLayout.pageBottomMobile, 'animate-in fade-in duration-500')}>
      <CourseDetailManageHeader
        course={course}
        curriculumEditHref={editHref}
        curriculumEditNavigationState={curriculumEditNavigationState}
        previewHref={previewHref}
        isAdmin={isAdmin}
        isPublished={isPublished}
        onEditClick={() => setEditOpen(true)}
        onPublishClick={() => setIsConfirm(true)}
      />

      <Tabs defaultValue="overview" className="w-full gap-4 sm:gap-6">
        <div className={manageDetailLayout.tabScroll}>
          <TabsList variant="line" className={manageDetailLayout.tabList}>
            {DETAIL_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={manageDetailLayout.tabTrigger}
              >
                <tab.icon className="size-4 opacity-70" aria-hidden />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-[18rem] sm:min-h-[24rem]">
          <TabsContent value="overview" className="mt-0 animate-in fade-in duration-300">
            <CourseDetailOverviewTab course={course} students={dataStudents} />
          </TabsContent>

          <TabsContent value="kurikulum" className="mt-0 animate-in fade-in duration-300">
            <CourseCurriculumTab modules={modules} editHref={editHref} />
          </TabsContent>

          <TabsContent value="peserta" className="mt-0 animate-in fade-in duration-300">
            <CourseParticipantsSection courseUid={courseUid} studentsData={dataStudents} />
          </TabsContent>

          <TabsContent value="review" className="mt-0 animate-in fade-in duration-300">
            <CourseReviewSection
              reviews={course.reviews || []}
              isAdmin={isAdmin}
              onReply={handleReplyReview}
            />
          </TabsContent>

          <TabsContent value="mentor" className="mt-0 animate-in fade-in duration-300">
            <CourseMentorTable
              mentors={course.mentors || []}
              isAdmin={isAdmin}
              assignAction={
                isAdmin ? (
                  <AssignCourseMentorDialog
                    courseUid={courseUid}
                    assignedMentorUids={(course.mentors ?? []).map((mentor) => mentor.uid)}
                  />
                ) : null
              }
            />
          </TabsContent>
        </div>
      </Tabs>

      <CourseDetailMobileActions
        curriculumEditHref={editHref}
        curriculumEditNavigationState={curriculumEditNavigationState}
        previewHref={previewHref}
        isAdmin={isAdmin}
        isPublished={isPublished}
        onEditClick={() => setEditOpen(true)}
        onPublishClick={() => setIsConfirm(true)}
      />

      <EditCourseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        course={course}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
        }}
      />

      {isConfirm ? (
        <ConfirmDialog
          title={isPublished ? 'Pembaruan status' : 'Publikasikan kursus'}
          description={
            isPublished
              ? 'Status kursus akan disinkronkan ulang menjadi aktif di platform.'
              : 'Kursus akan diaktifkan dan statusnya diperbarui menjadi aktif.'
          }
          confirmLabel={isPublished ? 'Update status' : 'Terbitkan'}
          onOpenChange={setIsConfirm}
          open={isConfirm}
          onConfirm={() => void handleConfirmStatusUpdate()}
          onCancel={() => setIsConfirm(false)}
        />
      ) : null}
    </div>
  )
}
