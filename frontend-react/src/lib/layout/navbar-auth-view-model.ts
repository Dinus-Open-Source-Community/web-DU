import type { UserRole } from '@/lib/types/user'

export type NavbarAuthViewModel = {
  isAuthenticated: boolean
  userName: string
  userEmail: string
  userRole: UserRole
  userAvatar: string
  onSignOut: () => void
}

export type AppTopNavbarAuthProps = {
  onSignOut: () => void
}

export type GuestNavbarAuthProps = NavbarAuthViewModel
