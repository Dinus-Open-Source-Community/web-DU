import DashboardSection from '@/components/student/DashboardSection'
import { AppSidebarProvider } from '../../components/shared/Sidebar'

import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <DashboardSection Data={profile as IUserData} />
    </AppSidebarProvider>
  )
}
