import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Message, resolveActionError } from '@/lib/Message'
import { courseKeys } from './query-keys'
import type { AssignMentorsToCoursePayload } from '@/lib/course-mentor/types'
import type { CreateCourseReviewReplyPayload } from '@/lib/course-review/types'
import {
  assignMentorsToCourse,
  unassignMentorsFromCourse,
  createCourse,
  deleteCourse,
  replyToCourseReview,
  updateCourse,
  updateCourseStatus,
  type CreateCoursePayload,
  type UpdateCoursePayload,
  type UpdateCourseStatusRequest,
} from '@/services/course'

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      toast.success(Message.course.createdDraft)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.createFailed))
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: UpdateCoursePayload }) =>
      updateCourse(uid, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.uid) })
      toast.success(Message.course.updated)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.updateFailed))
    },
  })
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateCourseStatusRequest) => updateCourseStatus(request),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success(Message.course.published)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.publishFailed))
    },
  })
}

export function useReplyCourseReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      reviewUid,
      payload,
    }: {
      courseUid: string
      reviewUid: string
      payload: CreateCourseReviewReplyPayload
    }) => replyToCourseReview(courseUid, reviewUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success(Message.review.replySent)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.review.replyFailed))
    },
  })
}

export function useAssignMentorsToCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      payload,
    }: {
      courseUid: string
      payload: AssignMentorsToCoursePayload
    }) => assignMentorsToCourse(courseUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success(Message.course.mentorAssigned)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.mentorAssignFailed))
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uid: string) => deleteCourse(uid),
    onSuccess: (_data, uid) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.removeQueries({ queryKey: courseKeys.detail(uid) })
      toast.success(Message.course.deactivated)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.deactivateFailed))
    },
  })
}

export function useUnassignMentorsFromCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      payload,
    }: {
      courseUid: string
      payload: AssignMentorsToCoursePayload
    }) => unassignMentorsFromCourse(courseUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success(Message.course.mentorUnassigned)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.course.mentorUnassignFailed))
    },
  })
}
