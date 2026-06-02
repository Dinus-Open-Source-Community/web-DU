import { AppSidebarProvider } from '@/components/shared/Sidebar'
import LearningSection from '@/components/student/LearningSection'
import type { IUserData } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

const Learning = () => {
  const { user, profile } = useAuth()
  return (
    <AppSidebarProvider role="student" user={{ name: user?.name as string, avatar_url: user?.avatar_url, email: user?.email as string }}>
      <LearningSection Data={profile as IUserData} />
    </AppSidebarProvider>
  )
}

export default Learning
