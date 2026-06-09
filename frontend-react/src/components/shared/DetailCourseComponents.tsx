import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EditCourseDialog } from '@/components/shared/course-form/EditCourseDialog'
import { useCourseDetailAssignmentsView } from '@/hooks/course-detail/use-course-detail-assignments-view'
import { useCourseDetailAttendanceView } from '@/hooks/course-detail/use-course-detail-attendance-view'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { CourseDetailShellProps } from '@/lib/course-detail/course-detail-manage-view-model'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent } from '../ui/tabs'
import { ConfirmDialog } from './ConfirmDialog'
import { CourseParticipantsSection } from './CourseParticipation'
import { AssignCourseMentorDialog } from './AssignCourseMentorDialog'
import { CourseMentorTable } from './CourseMentorTable'
import { CourseReviewSection } from './CourseReviewSection'
import { CourseCurriculumTab } from './CourseCurriculumTab'
import { CourseDetailManageHeader } from './course-detail-manage/CourseDetailManageHeader'
import { CourseDetailMobileActions } from './course-detail-manage/CourseDetailMobileActions'
import {
  CourseDetailNavTabs,
  type CourseDetailTabValue,
} from './course-detail-manage/CourseDetailNavTabs'
import { CourseDetailAssignmentsTab } from './course-detail-manage/CourseDetailAssignmentsTab'
import { CourseDetailAttendanceTab } from './course-detail-manage/CourseDetailAttendanceTab'
import { CourseDetailOverviewTab } from './course-detail-manage/CourseDetailOverviewTab'

export function DetailCourse({ view }: CourseDetailShellProps) {
  const {
    course,
    courseUid,
    isAdmin,
    isPublished,
    editHref,
    previewHref,
    curriculumEditNavigationState,
    modules,
    dataStudents,
    editOpen,
    onEditOpenChange,
    isConfirmOpen,
    onConfirmOpenChange,
    onEditClick,
    onPublishClick,
    confirmTitle,
    confirmDescription,
    confirmLabel,
    onConfirmPublish,
    onCancelPublish,
    onReplyReview,
    submittingReviewUid,
    editDialogSubmitting,
    onEditCourseSubmit,
    formOptions,
    assignMentorDialog,
  } = view

  const [searchParams] = useSearchParams()
  const tabFromQuery = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<CourseDetailTabValue>(
    tabFromQuery === 'assignments' ? 'assignments' : 'overview',
  )

  useEffect(() => {
    if (tabFromQuery === 'assignments') {
      setActiveTab('assignments')
    }
  }, [tabFromQuery])

  const assignmentsView = useCourseDetailAssignmentsView({
    courseUid,
    role: isAdmin ? 'admin' : 'mentor',
    modules,
    students: dataStudents,
    enabled: activeTab === 'assignments',
  })
  const attendanceView = useCourseDetailAttendanceView({
    modules,
    students: dataStudents,
    enabled: isAdmin && activeTab === 'attendance',
  })

  return (
    <div className={cn(manageDetailLayout.page, manageDetailLayout.pageBottomMobile, 'animate-in fade-in duration-500')}>
      <CourseDetailManageHeader
        course={course}
        curriculumEditHref={editHref}
        curriculumEditNavigationState={curriculumEditNavigationState}
        previewHref={previewHref}
        isAdmin={isAdmin}
        isPublished={isPublished}
        onEditClick={onEditClick}
        onPublishClick={onPublishClick}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CourseDetailTabValue)}
        className="w-full gap-4 sm:gap-6"
      >
        <CourseDetailNavTabs isAdmin={isAdmin} />

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

          <TabsContent value="assignments" className="mt-0 animate-in fade-in duration-300">
            <CourseDetailAssignmentsTab view={assignmentsView} />
          </TabsContent>

          {isAdmin ? (
            <TabsContent value="attendance" className="mt-0 animate-in fade-in duration-300">
              <CourseDetailAttendanceTab view={attendanceView} />
            </TabsContent>
          ) : null}

          <TabsContent value="review" className="mt-0 animate-in fade-in duration-300">
            <CourseReviewSection
              reviews={course.reviews || []}
              isAdmin={isAdmin}
              onReply={onReplyReview}
              submittingReviewUid={submittingReviewUid}
            />
          </TabsContent>

          {isAdmin && assignMentorDialog ? (
            <TabsContent value="mentor" className="mt-0 animate-in fade-in duration-300">
              <CourseMentorTable
                mentors={course.mentors || []}
                isAdmin={isAdmin}
                assignAction={<AssignCourseMentorDialog {...assignMentorDialog} />}
              />
            </TabsContent>
          ) : null}
        </div>
      </Tabs>

      <CourseDetailMobileActions
        curriculumEditHref={editHref}
        curriculumEditNavigationState={curriculumEditNavigationState}
        previewHref={previewHref}
        isAdmin={isAdmin}
        isPublished={isPublished}
        onEditClick={onEditClick}
        onPublishClick={onPublishClick}
      />

      <EditCourseDialog
        open={editOpen}
        onOpenChange={onEditOpenChange}
        course={course}
        submitting={editDialogSubmitting}
        onSubmitEdit={onEditCourseSubmit}
        categories={formOptions.categories}
        courseTypes={formOptions.courseTypes}
        optionsLoading={formOptions.optionsLoading}
      />

      {isConfirmOpen ? (
        <ConfirmDialog
          title={confirmTitle}
          description={confirmDescription}
          confirmLabel={confirmLabel}
          onOpenChange={onConfirmOpenChange}
          open={isConfirmOpen}
          onConfirm={onConfirmPublish}
          onCancel={onCancelPublish}
        />
      ) : null}
    </div>
  )
}
