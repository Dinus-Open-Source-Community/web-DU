import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useCourseFormOptions } from '@/hooks/course-form/use-course-form-options'
import { useAssignCourseMentorDialog } from '@/hooks/course-detail/use-assign-course-mentor-dialog'
import { courseKeys } from '@/hooks/query-keys'
import { useReplyCourseReview, useUpdateCourseStatus, useUpdateCourse } from '@/hooks/use-course-mutations'
import { buildCourseEditNavigationState } from '@/lib/course-edit/navigation-state'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type {
  CourseDetailManageInput,
  CourseDetailManageViewModel,
} from '@/lib/course-detail/course-detail-manage-view-model'
import { formValuesToUpdatePayload } from '@/lib/course-form/mappers'
import type { CourseFormValues } from '@/lib/course-form/types'
import { ROUTES } from '@/lib/routes'

export type { CourseDetailManageInput, CourseDetailManageViewModel } from '@/lib/course-detail/course-detail-manage-view-model'

export function useCourseDetailManageView({
  courseUid,
  role = 'mentor',
  dataCourse,
  dataStudents,
  dataModules,
}: CourseDetailManageInput): CourseDetailManageViewModel | null {
  const location = useLocation()
  const queryClient = useQueryClient()
  const updateCourseStatus = useUpdateCourseStatus()
  const replyCourseReview = useReplyCourseReview()
  const updateCourse = useUpdateCourse()
  const formOptions = useCourseFormOptions()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [submittingReviewUid, setSubmittingReviewUid] = useState<string | null>(null)

  const course = Array.isArray(dataCourse) ? dataCourse[0] : dataCourse
  const isAdmin = role === 'admin'

  const assignMentorDialog = useAssignCourseMentorDialog({
    courseUid,
    assignedMentorUids: (course?.mentors ?? []).map((mentor) => mentor.uid),
    enabled: isAdmin && Boolean(course),
  })

  const isPublished = course ? isCoursePublished(course) : false
  const editHref = isAdmin
    ? ROUTES.admin.courseEditAdmin(courseUid)
    : ROUTES.mentor.courseEditMentor(courseUid)
  const previewHref = ROUTES.viewModuleAndLessons(courseUid)
  const curriculumEditNavigationState = useMemo(
    () => buildCourseEditNavigationState(location),
    [location],
  )
  const modules = dataModules ?? course?.modules ?? []

  const onReplyReview = useCallback(
    async (reviewUid: string, comment: string) => {
      setSubmittingReviewUid(reviewUid)
      try {
        await replyCourseReview.mutateAsync({
          courseUid,
          reviewUid,
          payload: { comment },
        })
      } finally {
        setSubmittingReviewUid(null)
      }
    },
    [courseUid, replyCourseReview],
  )

  const onConfirmPublish = useCallback(async () => {
    try {
      await updateCourseStatus.mutateAsync({ courseUid })
      setIsConfirmOpen(false)
    } catch {
      // Error toast ditangani oleh mutation hook.
    }
  }, [courseUid, updateCourseStatus])

  const onEditCourseSubmit = useCallback(
    async (values: CourseFormValues) => {
      if (!course) return

      await updateCourse.mutateAsync({
        uid: course.uid,
        payload: formValuesToUpdatePayload(values),
      })

      await queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      setEditOpen(false)
    },
    [course, courseUid, queryClient, updateCourse],
  )

  if (!course) return null

  return {
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
    onEditOpenChange: setEditOpen,
    isConfirmOpen,
    onConfirmOpenChange: setIsConfirmOpen,
    onEditClick: () => setEditOpen(true),
    onPublishClick: () => setIsConfirmOpen(true),
    confirmTitle: isPublished ? 'Pembaruan status' : 'Publikasikan kursus',
    confirmDescription: isPublished
      ? 'Status kursus akan disinkronkan ulang menjadi aktif di platform.'
      : 'Kursus akan diaktifkan dan statusnya diperbarui menjadi aktif.',
    confirmLabel: isPublished ? 'Update status' : 'Terbitkan',
    onConfirmPublish: () => void onConfirmPublish(),
    onCancelPublish: () => setIsConfirmOpen(false),
    onReplyReview,
    submittingReviewUid,
    editDialogSubmitting: updateCourse.isPending,
    onEditCourseSubmit,
    formOptions,
    assignMentorDialog: isAdmin ? assignMentorDialog : null,
  }
}
