import { useQuery } from '@tanstack/react-query'

import { presentManagedUserDetail } from '@/lib/user-manage/user-detail-presenter'
import type { UserManageKind } from '@/lib/user-manage/page-config'
import { fetchManagedUserDetail } from '@/services/user-manage'
import { userManageKeys } from './query-keys'

type UseManagedUserDetailOptions = {
  uid: string
  kind: UserManageKind
  enabled?: boolean
}

export function useManagedUserDetail({ uid, kind, enabled = true }: UseManagedUserDetailOptions) {
  return useQuery({
    queryKey: userManageKeys.detail(uid),
    queryFn: async () => {
      const data = await fetchManagedUserDetail(uid)
      return presentManagedUserDetail(data, kind)
    },
    enabled: Boolean(uid) && enabled,
  })
}
