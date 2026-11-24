import { useParams } from 'react-router-dom'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { CourseAssignmentHub } from '@/components/shared/course-detail-manage/CourseAssignmentHub'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useAdminAppSidebar } from '@/hooks/use-sidebar-user'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { IModulesData } from '@/lib/types/course'
import { cn } from '@/lib/utils'

export default function AdminCourseAssignmentsPage() {
  const { courseUid } = useParams<{ courseUid: string }>()
  const { role: shellRole, user: sidebarUser } = useAdminAppSidebar()
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return <PageSkeleton message="Memuat kelola tugas" />
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <NotFoundContent
        description="Halaman kelola tugas tidak ditemukan"
        showBackButton={false}
        title="Data tidak ditemukan"
      />
    )
  }

  return (
    <AppSidebarProvider role={shellRole} user={sidebarUser}>
      <AdminPageShell
        className={cn(
          manageDetailLayout.page,
          manageDetailLayout.pageBottomMobile,
          'animate-in fade-in duration-500',
        )}
      >
        <CourseAssignmentHub
          courseUid={courseUid}
          courseTitle={courseDetail.data.title}
          role="admin"
          modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
          students={userCourse.data?.enrollments ?? []}
        />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
