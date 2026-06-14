import { useQuery } from '@tanstack/react-query'

import type { ManagedUserListParams } from '@/lib/user-manage/types'
import { fetchManagedUsers } from '@/services/user-manage'
import { userManageKeys } from './query-keys'

export function useManagedUsers(params?: ManagedUserListParams) {
  return useQuery({
    queryKey: userManageKeys.list(params),
    queryFn: () => fetchManagedUsers(params),
  })
}
