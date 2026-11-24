import { useParams } from 'react-router-dom'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { NotFoundContent } from '@/components/shared/Error'
import { PageSkeleton } from '@/components/shared/PageSkeleton'
import { CourseAssignmentHub } from '@/components/shared/course-detail-manage/CourseAssignmentHub'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useCourseDetailAdminAndMentor } from '@/hooks/use-course'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { IModulesData } from '@/lib/types/course'
import { cn } from '@/lib/utils'

export default function MentorCourseAssignmentsPage() {
  const { courseUid } = useParams<{ courseUid: string }>()
  const sidebarUser = useSidebarUser('mentor')
  const { courseDetail, moduleCourse, userCourse, isLoading } = useCourseDetailAdminAndMentor(
    courseUid ?? '',
  )

  if (isLoading) {
    return (
      <AppSidebarProvider role="mentor" user={sidebarUser}>
        <PageSkeleton message="Memuat kelola tugas" />
      </AppSidebarProvider>
    )
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <AppSidebarProvider role="mentor" user={sidebarUser}>
        <NotFoundContent
          description="Halaman kelola tugas tidak ditemukan"
          showBackButton={false}
          title="Data tidak ditemukan"
        />
      </AppSidebarProvider>
    )
  }

  return (
    <AppSidebarProvider role="mentor" user={sidebarUser}>
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
          role="mentor"
          modules={(moduleCourse.data?.modules as IModulesData[]) ?? []}
          students={userCourse.data?.enrollments ?? []}
        />
      </AdminPageShell>
    </AppSidebarProvider>
  )
}
