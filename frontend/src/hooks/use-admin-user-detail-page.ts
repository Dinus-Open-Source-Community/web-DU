import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getUserManageConfig, type UserManageKind } from '@/lib/user-manage/page-config'
import type { AssignableUserRole } from '@/lib/user-manage/types'
import type { ManagedUserRow } from '@/lib/user-manage/view-models'
import { useManagedUserDetail } from './use-managed-user-detail'
import { useDeleteManagedUser, useUpdateManagedUserRole } from './use-user-manage-mutations'

type UseAdminUserDetailPageOptions = {
  kind: UserManageKind
  uid: string
}

function toManagedUserRow(
  profile: NonNullable<ReturnType<typeof useManagedUserDetail>['data']>['profile'],
): ManagedUserRow {
  return {
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    status: profile.status,
    joinedAt: profile.createdAtLabel,
    lastActive: profile.updatedAtLabel,
    roleLabel: profile.roleLabel,
  }
}

export function useAdminUserDetailPage({ kind, uid }: UseAdminUserDetailPageOptions) {
  const navigate = useNavigate()
  const config = getUserManageConfig(kind)
  const detailQuery = useManagedUserDetail({ uid, kind })
  const updateRoleMutation = useUpdateManagedUserRole()
  const deleteUserMutation = useDeleteManagedUser()
  const [roleDialogUser, setRoleDialogUser] = useState<ManagedUserRow | null>(null)
  const [deleteDialogUser, setDeleteDialogUser] = useState<ManagedUserRow | null>(null)

  const selectedUser = useMemo(() => {
    if (!detailQuery.data) return null
    return toManagedUserRow(detailQuery.data.profile)
  }, [detailQuery.data])

  const handleUpdateRole = useCallback(
    async (uid: string, nextRole: AssignableUserRole) => {
      await updateRoleMutation.mutateAsync({
        uid,
        payload: { role: nextRole },
      })
      setRoleDialogUser(null)
      await detailQuery.refetch()
    },
    [detailQuery, updateRoleMutation],
  )

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return
    await deleteUserMutation.mutateAsync(selectedUser.uid)
    setDeleteDialogUser(null)
    navigate(config.path)
  }, [config.path, deleteUserMutation, navigate, selectedUser])

  return {
    config,
    viewModel: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,
    refetch: detailQuery.refetch,
    selectedUser,
    roleDialogUser,
    setRoleDialogUser,
    deleteDialogUser,
    setDeleteDialogUser,
    onUpdateRole: handleUpdateRole,
    onDeleteUser: handleDeleteUser,
    isMutating: updateRoleMutation.isPending || deleteUserMutation.isPending,
  }
}
