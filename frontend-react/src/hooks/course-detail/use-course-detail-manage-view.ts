import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useCourseFormOptions } from '@/hooks/course-form/use-course-form-options'
import { useAssignCourseMentorDialog } from '@/hooks/course-detail/use-assign-course-mentor-dialog'
import { courseKeys } from '@/hooks/query-keys'
import {
  useDeleteCourse,
  useReplyCourseReview,
  useUpdateCourseStatus,
  useUpdateCourse,
} from '@/hooks/use-course-mutations'
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateCourseStatus = useUpdateCourseStatus()
  const deleteCourseMutation = useDeleteCourse()
  const replyCourseReview = useReplyCourseReview()
  const updateCourse = useUpdateCourse()
  const formOptions = useCourseFormOptions()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
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

  const onConfirmDelete = useCallback(async () => {
    try {
      await deleteCourseMutation.mutateAsync(courseUid)
      setIsDeleteConfirmOpen(false)
      navigate(ROUTES.admin.courses)
    } catch {
      // Error toast ditangani oleh mutation hook.
    }
  }, [courseUid, deleteCourseMutation, navigate])

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
    modules: dataModules ?? course.modules ?? [],
    dataStudents,
    editOpen,
    onEditOpenChange: setEditOpen,
    isConfirmOpen,
    onConfirmOpenChange: setIsConfirmOpen,
    onEditClick: () => setEditOpen(true),
    onPublishClick: () => setIsConfirmOpen(true),
    confirmTitle: 'Terbit kursus?',
    confirmDescription:
      'Kursus akan diaktifkan (status ACTIVE) dan ditandai terbit (is_published).',
    confirmLabel: 'Terbit',
    onConfirmPublish: () => void onConfirmPublish(),
    onCancelPublish: () => setIsConfirmOpen(false),
    isDeleteConfirmOpen,
    onDeleteConfirmOpenChange: setIsDeleteConfirmOpen,
    onDeleteClick: () => setIsDeleteConfirmOpen(true),
    onConfirmDelete: () => void onConfirmDelete(),
    isDeleting: deleteCourseMutation.isPending,
    onReplyReview,
    submittingReviewUid,
    editDialogSubmitting: updateCourse.isPending,
    onEditCourseSubmit,
    formOptions,
    assignMentorDialog: isAdmin ? assignMentorDialog : null,
  }
}
