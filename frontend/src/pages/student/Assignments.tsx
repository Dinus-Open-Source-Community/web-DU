import { useSearchParams } from 'react-router-dom'

import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
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

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      {isAuthLoading && !profile ? <PageSkeleton message="Memuat daftar tugas..." /> : null}
      <StudentAssignmentsSection
        view={assignmentListView}
        isLoading={isAuthLoading || isAssignmentsLoading}
      />
    </AppSidebarProvider>
  )
}

export default Assignments
