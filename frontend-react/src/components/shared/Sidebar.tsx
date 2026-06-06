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
import { ROUTES } from '../../lib/routes'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../lib/types/user'
import { NavbarSearchProvider } from '../../providers/navbar-search-provider'
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
}

type AppSidebarProviderProps = AppLayoutProps

const sidebarRoleConfig: Record<UserRole, { navigationKey: keyof typeof Navigation; title: string; roleLabel: string }> = {
  admin: {
    navigationKey: 'Admin',
    title: 'Admin Dashboard',
    roleLabel: 'Administrator',
  },
  mentor: {
    navigationKey: 'Mentor',
    title: 'Mentor Dashboard',
    roleLabel: 'Mentor',
  },
  student: {
    navigationKey: 'Student',
    title: 'Student Dashboard',
    roleLabel: 'Student',
  },
}

function isActivePath(pathname: string, path?: string) {
  if (!path) return false
  return pathname === path || pathname.startsWith(`${path}/`)
}

function SidebarSubItem({ child, index, total }: { child: NavChildItem; index: number; total: number }) {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = isActivePath(pathname, child.path)
  const isLast = index === total - 1

  return (
    <Link to={child.path} onClick={() => setOpenMobile(false)} className="relative block pl-8">
      <svg className="pointer-events-none absolute left-0 top-0 h-full w-8 text-slate-200" viewBox="0 0 32 44" fill="none" aria-hidden>
        <path d={isLast ? 'M4 0 V18 Q4 26 12 26 H28' : 'M4 0 V44 M4 18 Q4 26 12 26 H28'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div
        className={cn(
          'group relative flex min-h-11 cursor-pointer items-center rounded-[10px] border-r-4 border-transparent bg-transparent px-4 text-sm transition-all duration-150',
          isActive ? 'border-primary bg-primary/10 font-semibold text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
        )}>
        {child.name}
      </div>
    </Link>
  )
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const isActive = pathname === item.path
  const Icon = item.icon

  if (!item.path) return null

  return (
    <SidebarMenuItem>
      <Link to={item.path} onClick={() => setOpenMobile(false)} className="block">
        <div
          className={cn(
            'group relative flex min-h-12 items-center gap-3 rounded-[10px] border-r-4 border-transparent px-4 text-sm font-medium transition-all duration-150',
            isActive ? 'border-primary bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}>
          {Icon && <Icon className={cn('size-[18px] flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />}
          <span>{item.name}</span>
        </div>
      </Link>
    </SidebarMenuItem>
  )
}

function SidebarNavGroup({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const isChildActive = item.children?.some((child) => isActivePath(pathname, child.path)) ?? false
  const isParentActive = item.path ? pathname === item.path : false
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
              isParentActive ? 'border-primary bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className={cn('size-[18px] flex-shrink-0 transition-colors', isParentActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')} />}
              <span>{item.name}</span>
            </div>
            <ChevronDown className={cn('size-4 flex-shrink-0 text-slate-400 transition-transform duration-300', isOpen ? 'rotate-180' : '')} />
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
    <div className={cn('relative flex h-16 flex-shrink-0 items-center border-b border-slate-100', isMobile ? 'justify-center px-12' : 'justify-center gap-3 px-5')}>
      <Link to={ROUTES.home} className={cn('flex flex-shrink-0 items-center gap-3', isMobile && 'mx-auto justify-center')}>
        <div className="overflow-hidden leading-none text-center">
          <span className="whitespace-nowrap pr-2 text-xl font-bold text-primary">Doscom</span>
          <span className="text-base font-medium text-gray-500">University</span>
        </div>
      </Link>

      {isMobile && (
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-[10px] text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Close sidebar">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function AppSidebar({ role }: { role: UserRole }) {
  const navigation = Navigation[sidebarRoleConfig[role].navigationKey]

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-slate-100 bg-white transition-all duration-300 ease-in-out [&_[data-slot=sidebar-inner]]:bg-white">
      <SidebarHeader className="p-0">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent className="flex-1 gap-0 overflow-y-auto px-4 py-5 md:py-4 md:px-3">
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
}: AppLayoutProps) {
  const normalizedUser = normalizeSidebarUser(user)

  return (
    <NavbarSearchProvider>
      <div className="flex min-h-dvh w-full flex-col bg-white">
        <AppTopNavbar
          role={role}
          user={normalizedUser}
          title={sidebarRoleConfig[role].title}
          showSidebarTrigger={false}
        />
        <main
          className={cn(
            'flex w-full flex-1 flex-col',
            contentClassName ?? 'gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10',
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

  return (
    <NavbarSearchProvider>
      <SidebarProvider
        open
        onOpenChange={() => undefined}
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-icon': '5rem',
          } as CSSProperties
        }>
        <AppSidebar role={role} />

        <SidebarInset className="min-w-0">
          <AppTopNavbar role={role} user={normalizedUser} title={sidebarRoleConfig[role].title} />
          <div
            className={cn(
              'flex w-full min-w-0 flex-col',
              contentClassName ?? 'gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10',
            )}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NavbarSearchProvider>
  )
}
export { AppSidebar }
