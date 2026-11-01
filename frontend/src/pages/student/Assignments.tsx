import { useSearchParams } from 'react-router-dom'

import { StudentAppPageShell } from '@/components/student/StudentAppPageShell'
import { StudentAssignmentsSection } from '@/components/student/AssignmentSection'
import { useStudentAssignmentItems } from '@/hooks/student-assignments/use-student-assignment-items'
import { useStudentAssignmentListView } from '@/hooks/student-assignments/use-student-assignment-list-view'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useAuth } from '@/providers/auth-provider'

const Assignments = () => {
  const [searchParams] = useSearchParams()
  const courseUidFilter = searchParams.get('courseUid')
  const { profile, isLoading: isAuthLoading } = useAuth()
  const sidebarUser = useSidebarUser('student')
  const { items: assignmentItems, isLoading: isAssignmentsLoading } =
    useStudentAssignmentItems(profile)
  const assignmentListView = useStudentAssignmentListView({
    items: assignmentItems,
    courseUidFilter,
  })

  // Skeleton ada di dalam `StudentAssignmentsSection` (bentuknya sudah sama
  // dengan daftar tugas asli), jadi tidak perlu `PageSkeleton` tambahan di sini
  // yang membuat dua skeleton muncul berurutan saat refresh.
  return (
    <StudentAppPageShell user={sidebarUser}>
      <StudentAssignmentsSection
        view={assignmentListView}
        isLoading={isAuthLoading || isAssignmentsLoading}
      />
    </StudentAppPageShell>
  )
}

export default Assignments
