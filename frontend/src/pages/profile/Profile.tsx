import { useCallback } from 'react'
import { toast } from 'sonner'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import ProfileSection from '@/components/profile/Section'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'
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
    <AppNavbarProvider
      role={profileUser.role}
      user={sidebarUser}
      navbarBack="history"
      contentClassName={cn(
        appPageContentClassName,
        appShellPageBgClassName,
        'relative',
      )}
    >
      <AdminPageShell className="gap-0">
        <ProfileSection view={view} />
      </AdminPageShell>
    </AppNavbarProvider>
  )
}
