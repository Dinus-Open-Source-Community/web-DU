import { UserManageRoleDialog } from '@/components/admin/user-manage/UserManageRoleDialog'
import { UserDetailProfileHeader } from '@/components/admin/user-manage/user-detail/UserDetailProfileHeader'
import { UserDetailSectionFilter } from '@/components/admin/user-manage/user-detail/UserDetailSectionFilter'
import { UserDetailSectionPanel } from '@/components/admin/user-manage/user-detail/UserDetailSectionPanel'
import { UserDetailStatsPanel } from '@/components/admin/user-manage/user-detail/UserDetailStatsPanel'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUserDetailSection } from '@/hooks/use-user-detail-section'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import type { ManagedUserDetailViewModel } from '@/lib/user-manage/user-detail-types'
import type { AssignableUserRole } from '@/lib/user-manage/types'
import type { ManagedUserRow } from '@/lib/user-manage/view-models'

type UserDetailViewProps = {
  kind: UserManageKind
  viewModel: ManagedUserDetailViewModel
  selectedUser: ManagedUserRow
  roleDialogUser: ManagedUserRow | null
  deleteDialogUser: ManagedUserRow | null
  onOpenRoleDialog: () => void
  onCloseRoleDialog: () => void
  onOpenDeleteDialog: () => void
  onCloseDeleteDialog: () => void
  onUpdateRole: (uid: string, role: AssignableUserRole) => Promise<void>
  onDeleteUser: () => Promise<void>
  isMutating?: boolean
}

export function UserDetailView({
  kind,
  viewModel,
  selectedUser,
  roleDialogUser,
  deleteDialogUser,
  onOpenRoleDialog,
  onCloseRoleDialog,
  onOpenDeleteDialog,
  onCloseDeleteDialog,
  onUpdateRole,
  onDeleteUser,
  isMutating = false,
}: UserDetailViewProps) {
  const config = getUserManageConfig(kind)
  const { activeSection, setActiveSection, sectionOptions, sectionContent, showSectionFilter } =
    useUserDetailSection(viewModel)

  return (
    <>
      <div className={userDetailLayout.page}>
        <UserDetailProfileHeader
          viewModel={viewModel}
          onOpenRoleDialog={onOpenRoleDialog}
          onOpenDeleteDialog={onOpenDeleteDialog}
          isMutating={isMutating}
        />

        <UserDetailStatsPanel stats={viewModel.stats} />

        <section className={userDetailLayout.contentPanel}>
          {showSectionFilter ? (
            <UserDetailSectionFilter
              value={activeSection}
              items={sectionOptions}
              onChange={setActiveSection}
            />
          ) : null}

          <div className={userDetailLayout.contentPanelBody}>
            <UserDetailSectionPanel sectionContent={sectionContent} viewModel={viewModel} />
          </div>
        </section>
      </div>

      <UserManageRoleDialog
        open={Boolean(roleDialogUser)}
        onOpenChange={(open) => {
          if (!open) onCloseRoleDialog()
        }}
        user={roleDialogUser}
        roleTargets={config.roleTargets}
        onConfirm={onUpdateRole}
        isSubmitting={isMutating}
      />

      <ConfirmDialog
        open={Boolean(deleteDialogUser)}
        onOpenChange={(open) => {
          if (!open) onCloseDeleteDialog()
        }}
        title="Hapus user?"
        description={`Akun ${selectedUser.name} akan dihapus permanen dari platform.`}
        confirmLabel="Hapus user"
        cancelLabel="Batal"
        onConfirm={() => {
          void onDeleteUser()
        }}
        variant="destructive"
      />
    </>
  )
}
