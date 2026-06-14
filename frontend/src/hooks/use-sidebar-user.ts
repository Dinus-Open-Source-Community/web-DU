import type { SidebarUser } from '@/components/shared/Sidebar'
import type { UserRole } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

const SIDEBAR_USER_FALLBACK: Record<UserRole, Pick<SidebarUser, 'name' | 'email'>> = {
  admin: { name: 'Admin', email: 'admin@doscom.id' },
  mentor: { name: 'Mentor', email: 'mentor@doscom.id' },
  student: { name: 'Student', email: 'student@doscom.id' },
}

export function useSidebarUser(role: UserRole): SidebarUser {
  const { user } = useAuth()
  const fallback = SIDEBAR_USER_FALLBACK[role]

  return {
    name: user?.name ?? fallback.name,
    email: user?.email ?? fallback.email,
    avatar_url: user?.avatar_url,
  }
}
