import { LogOut, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getAccountMenuNavContext,
  getAccountMenuNavLinks,
  shouldShowAccountSettingsLink,
} from '@/lib/layout/account-menu-nav'
import { greetingForUser, navbarUserRoleLabel } from '@/lib/layout/navbar-user-display'
import { ROUTES } from '@/lib/routes'
import type { UserRole } from '@/lib/types/user'
import { cn } from '@/lib/utils'

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type NavbarAccountHoverMenuProps = {
  userName: string
  userRole: UserRole
  userAvatar?: string | null
  dashboardHref: string
  onLogout: () => void
  /** Tampilan di shell dashboard (default) vs pembaca lesson. */
  variant?: 'shell' | 'lesson'
  lessonDark?: boolean
  className?: string
}

export function NavbarAccountHoverMenu({
  userName,
  userRole,
  userAvatar,
  dashboardHref,
  onLogout,
  variant = 'shell',
  lessonDark = false,
  className,
}: NavbarAccountHoverMenuProps) {
  const { pathname } = useLocation()
  const navContext = getAccountMenuNavContext(pathname)
  const navLinks = getAccountMenuNavLinks(navContext, dashboardHref)
  const showSettings = shouldShowAccountSettingsLink(navContext)

  const isLesson = variant === 'lesson'
  const isDark = isLesson && lessonDark

  const triggerTextName = isLesson
    ? isDark
      ? 'text-zinc-50'
      : 'text-ink-900'
    : 'text-foreground'
  const triggerTextRole = isLesson
    ? isDark
      ? 'text-zinc-400'
      : 'text-ink-500'
    : 'text-muted-foreground'

  const menuPanelClass = isLesson
    ? cn(
        'rounded-[10px] border-2 p-2 shadow-paper',
        isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-ink-900 bg-paper-white text-ink-900',
      )
    : 'bg-paper-white text-ink-900 shadow-paper rounded-[10px] border-2 border-ink-900 p-2'

  const menuItemClass = isLesson
    ? cn(
        'flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
        isDark ? 'hover:bg-zinc-800' : 'text-ink-900 hover:bg-paper-paper hover:text-brand-ink',
      )
    : 'text-ink-900 hover:text-brand-ink hover:bg-paper-paper flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30'

  return (
    <div className={cn('group relative cursor-pointer py-1', className)}>
      <div
        tabIndex={0}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-[10px] px-1 py-1 outline-none transition sm:gap-3 sm:px-1.5',
          !isLesson && 'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30',
          isLesson && isDark && 'hover:bg-zinc-800/80 focus-visible:ring-2 focus-visible:ring-primary/30',
          isLesson && !isDark && 'hover:bg-paper-paper focus-visible:ring-2 focus-visible:ring-primary/30',
        )}
        aria-haspopup="menu"
        aria-label="Menu akun"
      >
        <span className="hidden min-w-0 text-right sm:block">
          <span className={cn('block max-w-36 truncate text-sm font-semibold leading-5', triggerTextName)}>
            {userName}
          </span>
          <span className={cn('block text-xs font-medium leading-4', triggerTextRole)}>
            {navbarUserRoleLabel[userRole]}
          </span>
        </span>
        {isLesson ? (
          <Avatar className={cn('size-9 shrink-0 ring-2', isDark ? 'ring-zinc-600' : 'ring-ink-900/15')}>
            {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
            <AvatarFallback
              className={cn(
                'text-xs font-bold',
                isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-note-yellow text-ink-900',
              )}
            >
              {userInitials(userName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="size-9 shrink-0 ring-2 ring-ink-900/15 sm:size-10">
            {userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
            <AvatarFallback className="bg-note-yellow text-ink-900 text-xs font-bold">
              {userInitials(userName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div
        role="menu"
        className="pointer-events-none invisible absolute right-0 top-full z-50 w-64 pt-2 group-hover:visible group-hover:pointer-events-auto group-focus-within:visible group-focus-within:pointer-events-auto"
      >
        <div
          className={cn(
            menuPanelClass,
            'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          <div className="px-3 py-3">
            <p className="text-sm font-semibold">{greetingForUser(userName)}</p>
            <p className={cn('mt-1 text-xs leading-relaxed', isDark ? 'text-zinc-400' : 'text-ink-500')}>
              Senang bertemu lagi di Doscom University.
            </p>
          </div>
          <div className={cn('my-1 h-px', isDark ? 'bg-zinc-700' : 'bg-ink-900/10')} />
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} role="menuitem" className={menuItemClass}>
                <Icon className="size-4 opacity-70" aria-hidden />
                {item.label}
              </Link>
            )
          })}
          {showSettings ? (
            <Link to={ROUTES.profile} role="menuitem" className={menuItemClass}>
              <Settings className="size-4 opacity-70" aria-hidden />
              Pengaturan
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="text-destructive hover:bg-destructive/10 flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3 text-left text-sm font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-destructive/20"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
