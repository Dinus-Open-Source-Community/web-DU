import { useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

import {
  computeAssignmentStats,
  filterSubmissions,
  type SubmissionFilterStatus,
} from '@/lib/func/fungsi'
import type { MentorCourseAssignmentsViewModel } from '@/lib/mentor-assignments/mentor-assignments-view-model'
import type {
  ICourseDetailItem,
  IMentorAssignmentSubmission,
  IMentorCourseAssignment,
} from '@/lib/types/course'

export type { MentorCourseAssignmentsViewModel } from '@/lib/mentor-assignments/mentor-assignments-view-model'

const DEFAULT_MEETING_MAX = 8

type UseMentorCourseAssignmentsViewOptions = {
  courseData: ICourseDetailItem
  assignmentData: IMentorCourseAssignment[]
  submissionData: IMentorAssignmentSubmission[]
  now?: Date
  meetingMax?: number
  openCreateFormOnMount?: boolean
  onDeleteAssignment: (assignment: IMentorCourseAssignment) => boolean
  onReviewSaved: () => void
  onAssignmentSaved: (mode: 'create' | 'edit') => void
}

export function useMentorCourseAssignmentsView({
  courseData,
  assignmentData,
  submissionData,
  now: nowProp,
  meetingMax = DEFAULT_MEETING_MAX,
  openCreateFormOnMount = false,
  onDeleteAssignment,
  onReviewSaved,
  onAssignmentSaved,
}: UseMentorCourseAssignmentsViewOptions): MentorCourseAssignmentsViewModel {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const [assignmentUid, setAssignmentUid] = useState<string | 'all'>('all')
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionFilterStatus>('all')
  const [submissionDateRange, setSubmissionDateRange] = useState<DateRange | undefined>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeSubmission, setActiveSubmission] = useState<IMentorAssignmentSubmission | null>(null)
  const [assignmentFormOpen, setAssignmentFormOpen] = useState(openCreateFormOnMount)
  const [assignmentFormMode, setAssignmentFormMode] = useState<'create' | 'edit'>('create')
  const [editingAssignment, setEditingAssignment] = useState<IMentorCourseAssignment | null>(null)

  const stats = useMemo(
    () => computeAssignmentStats(assignmentData, submissionData, now),
    [assignmentData, submissionData, now],
  )

  const reviewDateFrom = useMemo(
    () => (submissionDateRange?.from ? format(submissionDateRange.from, 'yyyy-MM-dd') : undefined),
    [submissionDateRange],
  )
  const reviewDateTo = useMemo(
    () => (submissionDateRange?.to ? format(submissionDateRange.to, 'yyyy-MM-dd') : undefined),
    [submissionDateRange],
  )

  const filteredSubmissions = useMemo(
    () =>
      filterSubmissions(submissionData, {
        assignmentUid,
        status: submissionStatus,
        from: reviewDateFrom,
        to: reviewDateTo,
      }),
    [submissionData, assignmentUid, submissionStatus, reviewDateFrom, reviewDateTo],
  )

  const assignmentTitleMap = useMemo(() => {
    const map = new Map<string, string>()
    assignmentData.forEach((assignment) => map.set(assignment.uid, assignment.title))
    return map
  }, [assignmentData])

  const onOpenReview = useCallback((submission: IMentorAssignmentSubmission) => {
    setActiveSubmission(submission)
    setReviewOpen(true)
  }, [])

  const onOpenCreateForm = useCallback(() => {
    setAssignmentFormMode('create')
    setEditingAssignment(null)
    setAssignmentFormOpen(true)
  }, [])

  const onOpenEditForm = useCallback((assignment: IMentorCourseAssignment) => {
    setAssignmentFormMode('edit')
    setEditingAssignment(assignment)
    setAssignmentFormOpen(true)
  }, [])

  const handleDeleteAssignment = useCallback(
    (assignment: IMentorCourseAssignment) => {
      const deleted = onDeleteAssignment(assignment)
      if (deleted && assignmentUid === assignment.uid) {
        setAssignmentUid('all')
      }
    },
    [assignmentUid, onDeleteAssignment],
  )

  const handleAssignmentSaved = useCallback(() => {
    onAssignmentSaved(assignmentFormMode)
  }, [assignmentFormMode, onAssignmentSaved])

  return {
    now,
    meetingMax,
    courseData,
    assignmentData,
    stats,
    filteredSubmissions,
    assignmentTitleMap,
    assignmentUid,
    onAssignmentUidChange: setAssignmentUid,
    submissionStatus,
    onSubmissionStatusChange: setSubmissionStatus,
    submissionDateRange,
    onSubmissionDateRangeChange: setSubmissionDateRange,
    reviewOpen,
    onReviewOpenChange: setReviewOpen,
    activeSubmission,
    onOpenReview,
    assignmentFormOpen,
    onAssignmentFormOpenChange: setAssignmentFormOpen,
    assignmentFormMode,
    editingAssignment,
    onOpenCreateForm,
    onOpenEditForm,
    onDeleteAssignment: handleDeleteAssignment,
    onReviewSaved,
    onAssignmentSaved: handleAssignmentSaved,
  }
}
