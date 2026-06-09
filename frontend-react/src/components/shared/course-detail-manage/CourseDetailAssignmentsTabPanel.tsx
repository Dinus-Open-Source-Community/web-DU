import { useEffect, useState } from 'react'

import { useCourseDetailAssignmentsView } from '@/hooks/course-detail/use-course-detail-assignments-view'
import { CourseDetailAssignmentsTab } from '@/components/shared/course-detail-manage/CourseDetailAssignmentsTab'
import type { StaffAssignmentRole } from '@/lib/course-detail/course-assignment-navigation'
import type { IMentorCourseStudent } from '@/lib/types/course'

type CourseDetailAssignmentsTabPanelProps = {
  active: boolean
  courseUid: string
  role: StaffAssignmentRole
  students: IMentorCourseStudent[]
}

export function CourseDetailAssignmentsTabPanel({
  active,
  courseUid,
  role,
  students,
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
    />
  )
}

type CourseDetailAssignmentsTabContentProps = {
  courseUid: string
  role: StaffAssignmentRole
  students: IMentorCourseStudent[]
  enabled: boolean
}

function CourseDetailAssignmentsTabContent({
  courseUid,
  role,
  students,
  enabled,
}: CourseDetailAssignmentsTabContentProps) {
  const view = useCourseDetailAssignmentsView({
    courseUid,
    role,
    students,
    enabled,
  })

  return <CourseDetailAssignmentsTab view={view} />
}
