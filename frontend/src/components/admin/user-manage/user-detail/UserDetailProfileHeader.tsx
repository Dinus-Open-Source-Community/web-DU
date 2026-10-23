import { Trash2, UserCog } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AdminMetaLabel } from '@/lib/admin/status-label'
import { Button } from '@/components/ui/button'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type { ManagedUserDetailViewModel } from '@/lib/user-manage/user-detail-types'

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U'
}

type UserDetailProfileHeaderProps = {
  viewModel: ManagedUserDetailViewModel
  onOpenRoleDialog: () => void
  onOpenDeleteDialog: () => void
  isMutating?: boolean
}

export function UserDetailProfileHeader({
  viewModel,
  onOpenRoleDialog,
  onOpenDeleteDialog,
  isMutating = false,
}: UserDetailProfileHeaderProps) {
  const { profile } = viewModel

  return (
    <section className={userDetailLayout.surface}>
      <div className={`${userDetailLayout.surfacePadding} flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between`}>
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className={userDetailLayout.avatarFallback}>
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={userDetailLayout.profileName}>{profile.name}</h1>
              <AdminMetaLabel className="inline-flex items-center rounded-md border border-ink-900/10 bg-paper-paper px-2.5 py-0.5 text-xs font-bold text-ink-800">
                {profile.roleLabel}
              </AdminMetaLabel>
            </div>
            <p className={userDetailLayout.profileEmail}>{profile.email}</p>
            <p className={userDetailLayout.cardMeta}>
              Bergabung {profile.createdAtLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={userDetailLayout.actionButton}
            onClick={onOpenRoleDialog}
            disabled={isMutating}
          >
            <UserCog className="mr-1.5 size-3.5" aria-hidden />
            Ubah role
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`${userDetailLayout.actionButton} ${userDetailLayout.destructiveActionButton}`}
            onClick={onOpenDeleteDialog}
            disabled={isMutating}
          >
            <Trash2 className="mr-1.5 size-3.5" aria-hidden />
            Hapus
          </Button>
        </div>
      </div>
    </section>
  )
}
