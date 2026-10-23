import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type {
  AssignableUserRole,
  BatchUpdateUserRolePayload,
  UpdateUserRolePayload,
} from '@/lib/user-manage/types'
import { Message, messageUserRoleChanged, resolveActionError } from '@/lib/Message'
import {
  batchUpdateManagedUserRole,
  deleteManagedUser,
  updateManagedUserRole,
} from '@/services/user-manage'
import { authKeys, userManageKeys } from './query-keys'

const ROLE_LABELS: Record<AssignableUserRole, string> = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Admin',
}

function invalidateManagedUserQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  uid?: string,
) {
  void queryClient.invalidateQueries({ queryKey: userManageKeys.all })
  if (uid) {
    void queryClient.invalidateQueries({ queryKey: userManageKeys.detail(uid) })
  }
  void queryClient.invalidateQueries({ queryKey: authKeys.session })
}

export function useUpdateManagedUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: UpdateUserRolePayload }) =>
      updateManagedUserRole(uid, payload),
    onSuccess: (_data, variables) => {
      invalidateManagedUserQueries(queryClient, variables.uid)
      toast.success(messageUserRoleChanged(ROLE_LABELS[variables.payload.role]))
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.userManage.roleUpdateFailed))
    },
  })
}

export function useBatchUpdateManagedUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchUpdateUserRolePayload) => batchUpdateManagedUserRole(payload),
    onSuccess: (data, variables) => {
      invalidateManagedUserQueries(queryClient)
      for (const uid of variables.user_uids) {
        void queryClient.invalidateQueries({ queryKey: userManageKeys.detail(uid) })
      }
      const roleLabel = ROLE_LABELS[variables.role]
      const count = data?.updated_count ?? variables.user_uids.length
      if (count > 1) {
        toast.success(`${count} pengguna berhasil dijadikan ${roleLabel}.`)
      } else {
        toast.success(messageUserRoleChanged(roleLabel))
      }
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.userManage.roleUpdateFailed))
    },
  })
}

export function useDeleteManagedUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uid: string) => deleteManagedUser(uid),
    onSuccess: () => {
      invalidateManagedUserQueries(queryClient)
      toast.success(Message.userManage.deleted)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.userManage.deleteFailed))
    },
  })
}
