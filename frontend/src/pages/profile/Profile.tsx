import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { ProfileSectionSkeleton } from '@/components/profile/ProfileSkeleton'
import ProfileSection from '@/components/profile/Section'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { appShellPageBgClassName } from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { cn } from '@/lib/utils'
import { useProfileSectionView } from '@/hooks/profile/use-profile-section-view'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import { useConfirmEmailChange } from '@/hooks/use-user'
import { useAuth } from '@/providers/auth-provider'
import type { IAuthSessionUser } from '@/lib/types/auth'

const fallbackUser: IAuthSessionUser = {
  uid: 'profile-preview',
  name: 'Student',
  email: 'student@doscom.id',
  role: 'student',
}

export default function ProfilePage() {
  const { isLoading, refreshProfile, signInWithToken, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { mutateAsync: confirmEmailChange } = useConfirmEmailChange()
  const processedTokenRef = useRef<string | null>(null)

  const profileUser = user ?? fallbackUser
  const sidebarUser = useSidebarUser(profileUser.role)

  useEffect(() => {
    const token = searchParams.get('confirm_email_token')?.trim()
    if (!token || processedTokenRef.current === token) return
    processedTokenRef.current = token

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('confirm_email_token')
    setSearchParams(nextParams, { replace: true })

    void confirmEmailChange({ token })
      .then(async (result) => {
        if (result?.token) {
          await signInWithToken(result.token, result.expires_at)
        }
        await refreshProfile()
      })
      .catch(() => {
        // Error toast already handled by useConfirmEmailChange
      })
  }, [confirmEmailChange, refreshProfile, searchParams, setSearchParams, signInWithToken])

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
        {isLoading ? <ProfileSectionSkeleton /> : <ProfileSection view={view} />}
      </AdminPageShell>
    </AppNavbarProvider>
  )
}
