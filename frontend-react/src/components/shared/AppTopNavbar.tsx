import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Command, FileSearch, LogOut, Menu, Search, UserRound } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Navigation, flattenNavItems } from '../../lib/navigation'
import { ROUTES } from '../../lib/routes'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/types/user'
import type { SidebarUser } from './Sidebar'
import { useAuth } from '../../providers/auth-provider'
import { useNavbarSearch, type NavbarSearchItem } from '../../providers/navbar-search-provider'
import { SidebarTrigger } from '../ui/sidebar'

type AppTopNavbarProps = {
  role: UserRole
  user: SidebarUser
  title: string
  showSidebarTrigger?: boolean
}

function getUserInitial(user: SidebarUser) {
  return user.name.trim().charAt(0).toUpperCase() || 'U'
}

const roleLabel: Record<UserRole, string> = {
  admin: 'Administrator',
  mentor: 'Mentor',
  student: 'Student',
}

function matchesSearch(item: NavbarSearchItem, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).some((value) => value!.toLowerCase().includes(q))
}

function isActivePath(pathname: string, path?: string) {
  if (!path) return false
  return pathname === path || pathname.startsWith(`${path}/`)
}

function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function AppTopNavbar({
  role,
  user,
  title,
  showSidebarTrigger = true,
}: AppTopNavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const { localSearch } = useNavbarSearch()
  const [query, setQuery] = useState('')
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const navigationItems = useMemo<NavbarSearchItem[]>(() => {
    const key = role === 'admin' ? 'Admin' : role === 'mentor' ? 'Mentor' : 'Student'
    return [
      {
        id: 'profile',
        label: 'Profile',
        description: 'Buka pengaturan profil akun',
        path: ROUTES.profile,
        icon: UserRound,
        keywords: ['account', 'akun', 'settings', 'pengaturan'],
      },
      ...flattenNavItems(Navigation[key]).map((item) => ({
        id: item.path,
        label: item.name,
        description: 'Navigasi',
        path: item.path,
        icon: item.icon,
      })),
    ]
  }, [role])

  const localItems = useMemo(() => localSearch?.items ?? [], [localSearch?.items])
  const filteredNavigation = useMemo(() => navigationItems.filter((item) => matchesSearch(item, query)).slice(0, 8), [navigationItems, query])
  const filteredLocal = useMemo(() => localItems.filter((item) => matchesSearch(item, query)).slice(0, 8), [localItems, query])
  const placeholder = localSearch?.placeholder ?? 'Cari halaman, data, atau navigasi...'
  const profileImage = user.avatar ?? user.avatar_url

  const breadcrumbs = useMemo(() => {
    if (pathname === ROUTES.profile) {
      return [
        { label: title, path: role === 'admin' ? ROUTES.admin.dashboard : role === 'mentor' ? ROUTES.mentor.dashboard : ROUTES.student.dashboard },
        { label: 'Profile', path: ROUTES.profile },
      ]
    }

    const key = role === 'admin' ? 'Admin' : role === 'mentor' ? 'Mentor' : 'Student'
    const navItems = Navigation[key]
    const trail = [{ label: title, path: role === 'admin' ? ROUTES.admin.dashboard : role === 'mentor' ? ROUTES.mentor.dashboard : ROUTES.student.dashboard }]

    for (const item of navItems) {
      if (item.path && isActivePath(pathname, item.path)) {
        return [...trail, { label: item.name, path: item.path }]
      }

      const child = item.children?.find((childItem) => isActivePath(pathname, childItem.path))
      if (child) {
        return [...trail, { label: item.name }, { label: child.name, path: child.path }]
      }
    }

    const dynamicSegments = pathname
      .split('/')
      .filter(Boolean)
      .slice(1)
      .filter((segment) => !/^[a-z0-9_-]{8,}$/i.test(segment))
      .map((segment) => ({ label: titleCase(segment) }))

    return [...trail, ...dynamicSegments]
  }, [pathname, role, title])

  const visibleBreadcrumbs = breadcrumbs.length > 3 ? breadcrumbs.slice(-3) : breadcrumbs
  const hasHiddenBreadcrumbs = breadcrumbs.length > visibleBreadcrumbs.length

  const runLocalSearch = (nextQuery = query) => {
    if (!localSearch?.onSearch) return false
    localSearch.onSearch(nextQuery)
    return true
  }

  const selectItem = (item: NavbarSearchItem) => {
    item.onSelect?.()
    if (item.path) navigate(item.path)
    setIsCommandOpen(false)
    setQuery('')
  }

  const handleSubmitSearch = () => {
    const q = query.trim()
    if (runLocalSearch(q)) {
      setIsCommandOpen(false)
      return
    }

    const firstItem = [...filteredLocal, ...filteredNavigation][0]
    if (firstItem) selectItem(firstItem)
  }

  const handleInlineKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmitSearch()
    }
  }

  const handleCommandKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmitSearch()
    }
  }

  const handleLogout = () => {
    signOut()
    navigate(ROUTES.login)
  }

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!isCommandOpen) return
    window.setTimeout(() => searchInputRef.current?.focus(), 0)
  }, [isCommandOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 grid h-16 shrink-0 items-center gap-3 border-b border-slate-100 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6',
          showSidebarTrigger
            ? 'grid-cols-[auto_1fr_auto] lg:grid-cols-[minmax(0,1fr)_minmax(280px,560px)_minmax(0,1fr)]'
            : 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(280px,560px)_minmax(0,1fr)]',
        )}>
        {showSidebarTrigger ? (
          <SidebarTrigger className="size-10 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-95 lg:hidden">
            <Menu className="size-5" />
          </SidebarTrigger>
        ) : null}

        <nav
          aria-label="Breadcrumb"
          className={cn(
            'min-w-0 items-center gap-1 text-sm',
            showSidebarTrigger ? 'hidden lg:flex' : 'flex',
          )}>
          {hasHiddenBreadcrumbs ? (
            <>
              <span className="rounded-md px-1.5 py-1 text-slate-400">...</span>
              <ChevronRight className="size-3.5 shrink-0 text-slate-300" />
            </>
          ) : null}
          {visibleBreadcrumbs.map((crumb, index) => {
            const isLast = index === visibleBreadcrumbs.length - 1
            return (
              <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                {crumb.path && !isLast ? (
                  <Link to={crumb.path} className="max-w-36 truncate rounded-md px-1.5 py-1 font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 xl:max-w-44">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn('truncate rounded-md px-1.5 py-1', isLast ? 'max-w-48 font-semibold text-slate-900 xl:max-w-64' : 'max-w-36 font-medium text-slate-500 xl:max-w-44')}>{crumb.label}</span>
                )}
                {!isLast ? <ChevronRight className="size-3.5 shrink-0 text-slate-300" /> : null}
              </span>
            )
          })}
        </nav>

        <div className="relative col-start-2 w-full justify-self-center">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInlineKeyDown}
            onFocus={() => setIsCommandOpen(true)}
            placeholder={placeholder}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:pr-24"
          />
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 shadow-xs transition hover:text-slate-700 sm:inline-flex"
            aria-label="Buka command search">
            <Command className="size-3" />
            K
          </button>
        </div>

        <div className="col-start-3 flex shrink-0 items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleLogout} className="h-10 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="size-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
          <Link to={ROUTES.profile} aria-label="Buka profile" className="flex min-w-0 items-center gap-3 rounded-[10px] px-1.5 py-1 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-primary/15">
            <Avatar size="lg" className="border border-slate-200 bg-primary text-white shadow-sm">
              {profileImage ? <AvatarImage src={profileImage} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary text-sm font-bold text-white">{getUserInitial(user)}</AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block max-w-36 truncate text-sm font-semibold leading-5 text-slate-900">{user.name}</span>
              <span className="block text-xs font-medium leading-4 text-slate-400">{roleLabel[role]}</span>
            </span>
          </Link>
        </div>
      </header>

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="top-[18vh] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Command search</DialogTitle>
            <DialogDescription>Cari navigasi dan data pada halaman aktif.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search className="size-5 text-slate-400" aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleCommandKeyDown}
              placeholder={placeholder}
              className="h-10 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 sm:inline">Enter</kbd>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {localSearch?.onSearch && (
              <button type="button" onClick={() => handleSubmitSearch()} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <FileSearch className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">Cari di halaman ini</span>
                  <span className="block truncate text-xs text-slate-500">{query.trim() ? `"${query.trim()}"` : 'Gunakan data dan filter pada halaman aktif'}</span>
                </span>
                <ArrowRight className="size-4 text-slate-400" />
              </button>
            )}

            {filteredLocal.length > 0 && (
              <div className="mb-2">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Data halaman</p>
                {filteredLocal.map((item) => (
                  <SearchResultRow key={item.id} item={item} onSelect={() => selectItem(item)} />
                ))}
              </div>
            )}

            <div>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Navigasi</p>
              {filteredNavigation.length > 0 ? (
                filteredNavigation.map((item) => <SearchResultRow key={item.id} item={item} onSelect={() => selectItem(item)} />)
              ) : (
                <div className="px-3 py-8 text-center text-sm text-slate-500">Tidak ada hasil navigasi.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SearchResultRow({ item, onSelect }: { item: NavbarSearchItem; onSelect: () => void }) {
  const Icon = item.icon ?? ArrowRight

  return (
    <button type="button" onClick={onSelect} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500', item.path && 'bg-blue-50 text-primary')}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{item.label}</span>
        {item.description ? <span className="block truncate text-xs text-slate-500">{item.description}</span> : null}
      </span>
      <ArrowRight className="size-4 text-slate-300" />
    </button>
  )
}
