import type { AssignableUserRole } from '@/lib/user-manage/types'

export type ManagedUsersTableControls = {
  isLoading?: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onUpdateRole: (uid: string, role: AssignableUserRole) => Promise<void>
  onDeleteUser: (uid: string) => Promise<void>
  isMutating?: boolean
}
