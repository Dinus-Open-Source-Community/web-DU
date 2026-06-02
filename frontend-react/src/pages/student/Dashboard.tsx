import DashboardSection from '@/components/student/DashboardSection'
import { AppSidebarProvider } from '../../components/shared/Sidebar'

import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

export default function StudentDashboard() {
  const { user, profile } = useAuth()

  return (
    <AppSidebarProvider role="student" user={user as IUserData}>
      <DashboardSection Data={profile as IUserData} />
    </AppSidebarProvider>
  )
}
