import { Navigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/lib/routes'

/**
 * Legacy route — arahkan ke tab Tugas di halaman detail kursus mentor.
 */
export default function MentorCourseAssignmentsPage() {
  const { courseUid } = useParams<{ courseUid: string }>()

  if (!courseUid) {
    return <Navigate to={ROUTES.mentor.courses} replace />
  }

  return (
    <Navigate
      to={`${ROUTES.mentor.detailCourseMentor(courseUid)}?tab=assignments`}
      replace
    />
  )
}
