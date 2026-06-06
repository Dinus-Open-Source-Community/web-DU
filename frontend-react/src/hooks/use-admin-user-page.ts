import { useCallback, useState } from 'react'

import type { AssignableUserRole, ManagedUserListParams } from '@/lib/user-manage/types'
import { useManagedUsers } from './use-managed-users'
import { useDeleteManagedUser, useUpdateManagedUserRole } from './use-user-manage-mutations'

const PAGE_SIZE = 10

type UseAdminUserPageOptions = {
  role?: ManagedUserListParams['role']
}

export function useAdminUserPage({ role }: UseAdminUserPageOptions = {}) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const query = useManagedUsers({
    page,
    per_page: PAGE_SIZE,
    role,
    search: search || undefined,
    sort: 'created_at',
    order: 'desc',
  })

  const updateRoleMutation = useUpdateManagedUserRole()
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
    setPage,
    onSearch: handleSearch,
    onUpdateRole: handleUpdateRole,
    onDeleteUser: handleDeleteUser,
    isMutating: updateRoleMutation.isPending || deleteUserMutation.isPending,
  }
}
