import ProfileSection from '@/components/profile/Section'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAuth } from '@/providers/auth-provider'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import type { IAuthSessionUser } from '@/lib/types/auth'

const fallbackUser: IAuthSessionUser = {
  uid: 'profile-preview',
  name: 'Student',
  email: 'student@doscom.id',
  role: 'student',
}

export default function ProfilePage() {
  const { refreshProfile, user } = useAuth()
  const profileUser = user ?? fallbackUser
  const sidebarUser = useSidebarUser(profileUser.role)

  return (
    <AppSidebarProvider role={profileUser.role} user={sidebarUser}>
      <main>
        <ProfileSection user={profileUser} onAvatarUpdated={refreshProfile} />
      </main>
    </AppSidebarProvider>
  )
}
