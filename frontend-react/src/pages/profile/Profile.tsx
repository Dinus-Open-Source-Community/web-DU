import ProfileSection from '@/components/profile/Section'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useAuth } from '@/providers/auth-provider'
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

  return (
    <AppSidebarProvider role={profileUser.role} user={{ name: profileUser.name, email: profileUser.email, avatar: profileUser.avatar_url }}>
      <main>
        <ProfileSection user={profileUser} onAvatarUpdated={refreshProfile} />
      </main>
    </AppSidebarProvider>
  )
}
