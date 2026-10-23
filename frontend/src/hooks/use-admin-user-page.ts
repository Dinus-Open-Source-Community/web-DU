import { useCallback, useState } from 'react'

import type { AssignableUserRole, ManagedUserListParams } from '@/lib/user-manage/types'
import { useManagedUsers } from './use-managed-users'
import {
  useBatchUpdateManagedUserRole,
  useDeleteManagedUser,
  useUpdateManagedUserRole,
} from './use-user-manage-mutations'

type UseAdminUserPageOptions = {
  role?: ManagedUserListParams['role']
}

export function useAdminUserPage({ role }: UseAdminUserPageOptions = {}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const query = useManagedUsers({
    page,
    per_page: pageSize,
    role,
    search: search || undefined,
    sort: 'created_at',
    order: 'desc',
  })

  const updateRoleMutation = useUpdateManagedUserRole()
  const batchUpdateRoleMutation = useBatchUpdateManagedUserRole()
  const deleteUserMutation = useDeleteManagedUser()

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleUpdateRole = useCallback(
    async (uid: string, nextRole: AssignableUserRole) => {
      await updateRoleMutation.mutateAsync({ uid, payload: { role: nextRole } })
    },
    [updateRoleMutation],
  )

  const handleBatchUpdateRole = useCallback(
    async (uids: string[], nextRole: AssignableUserRole) => {
      await batchUpdateRoleMutation.mutateAsync({ user_uids: uids, role: nextRole })
    },
    [batchUpdateRoleMutation],
  )

  const handleDeleteUser = useCallback(
    async (uid: string) => {
      await deleteUserMutation.mutateAsync(uid)

      const currentPageCount = query.data?.users.length ?? 0
      if (currentPageCount === 1 && page > 1) {
        setPage((current) => current - 1)
      }
    },
    [deleteUserMutation, page, query.data?.users.length],
  )

  return {
    users: query.data?.users ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    page,
    totalPages: query.data?.meta.total_pages ?? 1,
    pageSize,
    setPageSize: (newSize: number) => {
      setPageSize(newSize)
      setPage(1)
    },
    setPage,
    onSearch: handleSearch,
    onUpdateRole: handleUpdateRole,
    onBatchUpdateRole: handleBatchUpdateRole,
    onDeleteUser: handleDeleteUser,
    isMutating:
      updateRoleMutation.isPending ||
      batchUpdateRoleMutation.isPending ||
      deleteUserMutation.isPending,
  }
}
