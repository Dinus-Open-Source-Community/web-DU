import { useEffect, useState, type ReactNode } from 'react'

import { useCourseDetailAssignmentsView } from '@/hooks/course-detail/use-course-detail-assignments-view'
import { CourseDetailAssignmentsTab } from '@/components/shared/course-detail-manage/CourseDetailAssignmentsTab'
import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { IMentorCourseStudent } from '@/lib/types/course'

type CourseDetailAssignmentsTabPanelProps = {
  active: boolean
  courseUid: string
  role: StaffAssignmentRole
  students: IMentorCourseStudent[]
  /** Aksi tingkat halaman (mis. tautan Halaman tugas) di samping judul. */
  actions?: ReactNode
}

export function CourseDetailAssignmentsTabPanel({
  active,
  courseUid,
  role,
  students,
  actions,
}: CourseDetailAssignmentsTabPanelProps) {
  const [hasVisited, setHasVisited] = useState(active)

  useEffect(() => {
    if (active) setHasVisited(true)
  }, [active])

  if (!hasVisited) return null

  return (
    <CourseDetailAssignmentsTabContent
      courseUid={courseUid}
      role={role}
      students={students}
      enabled={active}
      actions={actions}
    />
  )
}

type CourseDetailAssignmentsTabContentProps = {
  courseUid: string
  role: StaffAssignmentRole
  students: IMentorCourseStudent[]
  enabled: boolean
  actions?: ReactNode
}

function CourseDetailAssignmentsTabContent({
  courseUid,
  role,
  students,
  enabled,
  actions,
}: CourseDetailAssignmentsTabContentProps) {
  const view = useCourseDetailAssignmentsView({
    courseUid,
    role,
    students,
    enabled,
  })

  return <CourseDetailAssignmentsTab view={view} actions={actions} />
}
