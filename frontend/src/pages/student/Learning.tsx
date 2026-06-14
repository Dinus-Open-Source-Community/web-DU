import { AppSidebarProvider } from '@/components/shared/Sidebar'
import LearningSection from '@/components/student/LearningSection'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'
import { useSidebarUser } from '@/hooks/use-sidebar-user'

const Learning = () => {
  const { profile } = useAuth()
  const sidebarUser = useSidebarUser('student')

  return (
    <AppSidebarProvider role="student" user={sidebarUser}>
      <LearningSection Data={profile as IUserData} />
    </AppSidebarProvider>
  )
}

export default Learning
