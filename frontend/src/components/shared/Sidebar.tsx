import { ChevronDown, X } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '../../components/ui/sidebar'
import type { NavChildItem, NavItem } from '../../lib/types/utils'
import { Navigation } from '../../lib/navigation'
import { isNavLinkActive } from '@/lib/dashboard-route'
import { ROUTES } from '../../lib/routes'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/types/user'
import { NavbarSearchProvider } from '../../providers/navbar-search-provider'
import { useAppTopNavbarAuth } from '@/hooks/layout/use-navbar-auth'
import {
  appShellGridOverlayClassName,
  appShellPageBgClassName,
  appShellSidebarClassName,
  brandWordmarkClassName,
} from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { AppTopNavbar } from './AppTopNavbar'

export type SidebarUser = {
  name: string
  email: string
  avatar?: string
  avatar_url?: string
}

type AppLayoutProps = {
  children: ReactNode
  role: UserRole
  user: SidebarUser
  contentClassName?: string
  /** Tanpa sidebar — tombol kembali di navbar (breadcrumb disembunyikan). */
  navbarBack?: 'dashboard' | 'history'
}

type AppSidebarProviderProps = AppLayoutProps

function sidebarNavActiveClass(isActive: boolean) {
  if (!isActive) {
    return 'text-ink-600 hover:bg-paper-paper hover:text-ink-900'
  }
  return 'border-brand-blue bg-brand-blue/25 font-semibold text-ink-900'
}

const sidebarRoleConfig: Record<UserRole, { navigationKey: keyof typeof Navigation; roleLabel: string }> = {
  admin: {
    navigationKey: 'Admin',
    roleLabel: 'Administrator',
  },
  super_admin: {
    navigationKey: 'SuperAdmin',
    roleLabel: 'Super Admin',
  },
  mentor: {
    navigationKey: 'Mentor',
    roleLabel: 'Mentor',
  },
  student: {
    navigationKey: 'Student',
    roleLabel: 'Student',
  },
}

function SidebarSubItem({ child, index, total }: { child: NavChildItem; index: number; total: number }) {
  const { pathname, search } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = isNavLinkActive(pathname, search, child.path)
  const isLast = index === total - 1

  return (
    <Link to={child.path} onClick={() => setOpenMobile(false)} className="relative block pl-8">
      <svg
        className={cn(
          'pointer-events-none absolute left-0 top-0 h-full w-8',
          'text-line-light',
        )}
        viewBox="0 0 32 44"
        fill="none"
        aria-hidden
      >
        <path d={isLast ? 'M4 0 V18 Q4 26 12 26 H28' : 'M4 0 V44 M4 18 Q4 26 12 26 H28'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div
        className={cn(
          'group relative flex min-h-11 cursor-pointer items-center rounded-[10px] border-r-4 border-transparent bg-transparent px-4 text-sm transition-all duration-150',
          sidebarNavActiveClass(isActive),
        )}>
        {child.name}
      </div>
    </Link>
  )
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const { pathname, search } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = item.path ? isNavLinkActive(pathname, search, item.path) : false
  const Icon = item.icon

  if (!item.path) return null

  return (
    <SidebarMenuItem>
      <Link to={item.path} onClick={() => setOpenMobile(false)} className="block">
        <div
          className={cn(
            'group relative flex min-h-12 items-center gap-3 rounded-[10px] border-r-4 border-transparent px-4 text-sm font-medium transition-all duration-150',
            sidebarNavActiveClass(isActive),
          )}>
          {Icon ? (
            <Icon
              className={cn(
                'size-[18px] flex-shrink-0 transition-colors',
                isActive
                  ? 'text-brand-ink'
                  : 'text-ink-400 group-hover:text-ink-600',
              )}
            />
          ) : null}
          <span>{item.name}</span>
        </div>
      </Link>
    </SidebarMenuItem>
  )
}

function SidebarNavGroup({ item }: { item: NavItem }) {
  const { pathname, search } = useLocation()
  const isChildActive =
    item.children?.some((child) => isNavLinkActive(pathname, search, child.path)) ?? false
  const isParentActive = item.path ? isNavLinkActive(pathname, search, item.path) : false
  const [isOpen, setIsOpen] = useState(isChildActive)
  const Icon = item.icon

  useEffect(() => {
    if (isChildActive) setIsOpen(true)
  }, [isChildActive])

  return (
    <SidebarMenuItem className="flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'group relative flex min-h-12 w-full items-center justify-between rounded-[10px] border-r-4 border-transparent px-4 text-sm font-medium transition-all duration-150',
              sidebarNavActiveClass(isParentActive),
            )}>
            <div className="flex items-center gap-3">
              {Icon ? (
                <Icon
                  className={cn(
                    'size-[18px] flex-shrink-0 transition-colors',
                    isParentActive
                      ? 'text-brand-ink'
                      : 'text-ink-400 group-hover:text-ink-600',
                  )}
                />
              ) : null}
              <span>{item.name}</span>
            </div>
            <ChevronDown className={cn('size-4 flex-shrink-0 text-ink-400 transition-transform duration-300', isOpen ? 'rotate-180' : '')} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className={cn('grid transition-all duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] pointer-events-none opacity-0')}>
          <div className="overflow-hidden">
            <div className="relative mt-1 space-y-0 pb-1 pl-4">
              {item.children?.map((child, index, children) => (
                <SidebarSubItem key={child.path} child={child} index={index} total={children.length} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function SidebarBrand() {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <div
      className={cn(
        'relative flex h-16 flex-shrink-0 items-center',
        'border-b-2 border-ink-900/10',
        isMobile ? 'justify-center px-12' : 'justify-center gap-3 px-5',
      )}
    >
      <Link
        to={ROUTES.home}
        className={cn('flex flex-shrink-0 items-center', isMobile && 'mx-auto justify-center')}
      >
        <span className={cn(brandWordmarkClassName, 'whitespace-nowrap')}>Doscom University</span>
      </Link>

      {isMobile && (
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-[10px] text-ink-500 transition-all duration-200 hover:bg-paper-paper hover:text-ink-900 active:scale-95"
          aria-label="Tutup sidebar">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function AppSidebar({ role }: { role: UserRole }) {
  const navigation = Navigation[sidebarRoleConfig[role].navigationKey]

  return (
    <Sidebar
      collapsible="offcanvas"
      className={cn(
        'transition-all duration-300 ease-in-out',
        appShellSidebarClassName,
      )}
    >
      <SidebarHeader className="p-0">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent className="flex-1 gap-0 overflow-y-auto px-4 py-5 md:px-5 md:py-6 lg:px-4 lg:py-5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0 space-y-2.5">
              {navigation.map((item) => {
                if (item.children) {
                  return <SidebarNavGroup key={item.name} item={item} />
                }

                return <SidebarNavItem key={item.path ?? item.name} item={item} />
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function normalizeSidebarUser(user: SidebarUser) {
  return {
    ...user,
    avatar: user.avatar ?? user.avatar_url,
  }
}

export function AppNavbarProvider({
  children,
  role,
  user,
  contentClassName,
  navbarBack,
}: AppLayoutProps) {
  const normalizedUser = normalizeSidebarUser(user)
  const { onSignOut } = useAppTopNavbarAuth()

  return (
    <NavbarSearchProvider>
      <div
        className="relative flex min-h-dvh w-full flex-col bg-paper-offwhite"
      >
        <div aria-hidden className={appShellGridOverlayClassName} />
        <AppTopNavbar
          role={role}
          user={normalizedUser}
          showSidebarTrigger={false}
          navbarBack={navbarBack}
          onSignOut={onSignOut}
        />
        <main
          className={cn(
            'relative z-[1] flex w-full flex-1 flex-col',
            contentClassName ?? appPageContentClassName,
          )}>
          {children}
        </main>
      </div>
    </NavbarSearchProvider>
  )
}

export function AppSidebarProvider({
  children,
  role,
  user,
  contentClassName,
}: AppSidebarProviderProps) {
  const normalizedUser = normalizeSidebarUser(user)
  const { onSignOut } = useAppTopNavbarAuth()

  return (
    <NavbarSearchProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '5rem',
          } as CSSProperties
        }>
        <AppSidebar role={role} />

        <SidebarInset
          className={cn('relative min-w-0 flex-1 min-h-svh bg-paper-offwhite', appShellPageBgClassName)}
        >
          <div aria-hidden className={appShellGridOverlayClassName} />
          <AppTopNavbar role={role} user={normalizedUser} onSignOut={onSignOut} />
          <div
            className={cn(
              'relative z-[1] flex w-full min-w-0 flex-1 flex-col',
              contentClassName ?? appPageContentClassName,
            )}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NavbarSearchProvider>
  )
}
export { AppSidebar }
