import { useEffect } from 'react'
import { ArrowLeft, List } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppShellNavbarSearch } from '@/components/shared/AppShellNavbarSearch'
import { NavbarAccountHoverMenu } from '@/components/shared/NavbarAccountHoverMenu'
import { useNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import { appShellTopBarClassName } from '@/lib/design/app-shell-tokens'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

import type { LessonThemeMode } from '@/lib/course-module-viewer/lesson-viewer-utils'

type LessonViewerHeaderProps = {
  backHref: string
  theme: LessonThemeMode
  onOpenSearch: () => void
  onOpenModules?: () => void
}

export function LessonViewerHeader({
  backHref,
  theme,
  onOpenSearch,
  onOpenModules,
}: LessonViewerHeaderProps) {
  const isDark = theme === 'dark'
  const auth = useNavbarAuth()

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenSearch()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onOpenSearch])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex h-16 min-w-0 shrink-0 items-center gap-2 px-4 sm:gap-3 sm:px-5 md:px-6 lg:gap-4 lg:px-8',
        isDark ? 'border-b border-zinc-800 bg-zinc-950/95 text-zinc-100 backdrop-blur' : appShellTopBarClassName,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 md:max-w-[min(100%,280px)] md:gap-3">
        <Link
          to={backHref}
          className={cn(
            'flex min-w-0 items-center gap-2 text-sm font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
            isDark ? 'text-zinc-100 hover:text-white' : 'text-ink-900 hover:text-primary',
          )}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span className="truncate">Keluar dari halaman</span>
        </Link>
      </div>

      <AppShellNavbarSearch
        placeholder="Cari modul atau konten..."
        onActivate={onOpenSearch}
      />

      <div className="flex shrink-0 items-center justify-end gap-2 pl-1 sm:pl-2">
        {onOpenModules ? (
          <button
            type="button"
            onClick={onOpenModules}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl border border-input bg-muted text-muted-foreground transition outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 lg:hidden',
            )}
            aria-label="Buka daftar modul"
          >
            <List className="size-4" />
          </button>
        ) : null}

        {auth.isAuthenticated ? (
          <NavbarAccountHoverMenu
            userName={auth.userName}
            userRole={auth.userRole}
            userAvatar={auth.userAvatar}
            dashboardHref={ROUTES.dashboard}
            onLogout={auth.onSignOut}
            variant="lesson"
            lessonDark={isDark}
            className="hidden sm:block"
          />
        ) : null}
      </div>
    </header>
  )
}
