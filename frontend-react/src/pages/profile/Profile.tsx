import { useCallback } from 'react'
import { toast } from 'sonner'

import ProfileSection from '@/components/profile/Section'
import { AppSidebarProvider } from '@/components/shared/Sidebar'
import { useProfileSectionView } from '@/hooks/profile/use-profile-section-view'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
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
  const sidebarUser = useSidebarUser(profileUser.role)

  const handleValidationError = useCallback((message: string) => {
    toast.error(message)
  }, [])

  const view = useProfileSectionView({
    user: profileUser,
    onAvatarUpdated: refreshProfile,
    onValidationError: handleValidationError,
  })

  return (
    <AppSidebarProvider role={profileUser.role} user={sidebarUser}>
      <main>
        <ProfileSection view={view} />
      </main>
    </AppSidebarProvider>
  )
}
