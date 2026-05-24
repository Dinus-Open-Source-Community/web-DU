import { ChevronDown, ChevronsLeft, ChevronsRight, LogOut, User } from 'lucide-react'
import { useCallback, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, useSidebar } from '../../components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import type { NavChildItem, NavItem } from '../../lib/types/utils'
import { Navigation } from '../../lib/navigation'
import { ROUTES } from '../../lib/routes'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { cn } from '../../lib/utils'

interface FlyoutState {
  name: string
  items: NavChildItem[]
  top: number
}

function isActivePath(pathname: string, path?: string) {
  if (!path) return false
  return pathname === path || pathname.startsWith(`${path}/`)
}

function SidebarSubItem({ child }: { child: NavChildItem }) {
  const { pathname } = useLocation()
  const isActive = isActivePath(pathname, child.path)

  return (
    <Link to={child.path} className="block">
      <div
        className={cn(
          'relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-[7px] text-sm transition-all duration-150',
          isActive ? 'bg-[#0a84dc] font-medium text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
        )}>
        <span className={cn('size-[7px] flex-shrink-0 rounded-full transition-all duration-150', isActive ? 'bg-white shadow-[0_0_0_2px_rgba(10,132,220,0.2)]' : 'bg-slate-300')} />
        {child.name}
      </div>
    </Link>
  )
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const isActive = pathname === item.path
  const Icon = item.icon

  if (!item.path) return null

  return (
    <SidebarMenuItem>
      <Link to={item.path} className="block">
        <div
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3.5 py-[9px] text-sm font-medium transition-all duration-150',
            isActive ? 'bg-[#0a84dc] text-white shadow-sm shadow-blue-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}>
          {Icon && <Icon className={cn('size-[18px] flex-shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')} />}
          <span>{item.name}</span>
        </div>
      </Link>
    </SidebarMenuItem>
  )
}

function SidebarNavGroup({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const isChildActive = item.children?.some((child) => isActivePath(pathname, child.path)) ?? false
  const [isOpen, setIsOpen] = useState(isChildActive)
  const Icon = item.icon

  return (
    <SidebarMenuItem className="flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              'group flex w-full items-center justify-between rounded-xl px-3.5 py-[9px] text-sm font-medium transition-all duration-150',
              isChildActive ? 'bg-[#0a84dc] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className={cn('size-[18px] flex-shrink-0 transition-colors', isChildActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')} />}
              <span>{item.name}</span>
            </div>
            <ChevronDown className={cn('size-4 flex-shrink-0 transition-transform duration-300', isOpen ? 'rotate-180' : '', isChildActive ? 'text-white' : 'text-slate-400')} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className={cn('grid transition-all duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] pointer-events-none opacity-0')}>
          <div className="overflow-hidden">
            <div className="mt-1 ml-[22px] space-y-0.5 border-l-2 border-blue-200/70 pb-1 pl-4">
              {item.children?.map((child) => (
                <SidebarSubItem key={child.path} child={child} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function SidebarMinimizedItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()
  const isActive = pathname === item.path
  const Icon = item.icon

  if (!item.path) return null

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.path} className="block">
            <div
              className={cn(
                'mx-auto flex size-10 items-center justify-center rounded-xl transition-all duration-150',
                isActive ? 'bg-[#0a84dc] text-white shadow-sm shadow-blue-300' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
              )}>
              {Icon && <Icon className="size-[18px]" />}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="z-[70] select-none rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
          {item.name}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

function SidebarMinimizedGroup({ item, onMouseEnter, onMouseLeave }: { item: NavItem; onMouseEnter: (event: MouseEvent<HTMLButtonElement>) => void; onMouseLeave: () => void }) {
  const { pathname } = useLocation()
  const isChildActive = item.children?.some((child) => isActivePath(pathname, child.path)) ?? false
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          'mx-auto flex size-10 items-center justify-center rounded-xl transition-all duration-150',
          isChildActive ? 'bg-blue-50 text-[#0a84dc]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
        )}>
        {Icon && <Icon className="size-[18px]" />}
      </button>
    </SidebarMenuItem>
  )
}

function SidebarFlyout({ flyout, onMouseEnter, onMouseLeave, onNavigate }: { flyout: FlyoutState; onMouseEnter: () => void; onMouseLeave: () => void; onNavigate: () => void }) {
  const { pathname } = useLocation()

  return (
    <div
      style={{ top: flyout.top, left: 88 }}
      className="fixed z-[60] min-w-[192px] rounded-xl border border-slate-100 bg-white py-2 shadow-xl duration-150 animate-in fade-in slide-in-from-left-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <div className="mb-1 border-b border-slate-100 px-4 py-2">
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{flyout.name}</span>
      </div>

      <ul className="space-y-0.5 px-2">
        {flyout.items.map((child) => {
          const isActive = isActivePath(pathname, child.path)

          return (
            <li key={child.path}>
              <Link to={child.path} onClick={onNavigate} className="block">
                <div
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                    isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}>
                  <span className={cn('size-1.5 flex-shrink-0 rounded-full', isActive ? 'bg-[#0a84dc]' : 'bg-slate-300')} />
                  {child.name}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarBrand() {
  const { state, toggleSidebar } = useSidebar()
  const isMinimized = state === 'collapsed'

  return (
    <div className={cn('relative flex h-16 flex-shrink-0 items-center border-b border-slate-100', isMinimized ? 'justify-center px-0' : 'gap-3 px-5')}>
      <Link to={ROUTES.home} className="flex flex-shrink-0 items-center gap-3">
        {!isMinimized && (
          <div className="overflow-hidden leading-none text-center">
            <span className="whitespace-nowrap pr-2 text-xl font-bold text-primary">Doscom</span>
            <span className="text-base font-medium text-gray-500">University</span>
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute top-[22px] -right-3 z-10 hidden size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:text-[#0a84dc] lg:flex"
        aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}>
        {isMinimized ? <ChevronsRight className="size-3" /> : <ChevronsLeft className="size-3" />}
      </button>
    </div>
  )
}

function AdminSidebarFooter() {
  const { state } = useSidebar()
  const isMinimized = state === 'collapsed'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const user = {
    name: 'Admin',
    email: 'admin@doscom.id',
    role: 'Administrator',
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDropdownOpen(false)
    }
  }

  if (isMinimized) {
    return (
      <SidebarFooter className="flex-shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          className="mx-auto flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm transition-all hover:shadow-blue-200"
          aria-label={user.name}>
          A
        </button>
      </SidebarFooter>
    )
  }

  return (
    <SidebarFooter className="relative flex-shrink-0 border-t border-slate-100 p-0" onBlur={handleBlur}>
      {isDropdownOpen && (
        <div className="absolute right-3 bottom-full left-3 z-10 mb-1 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg duration-150 animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <User className="size-4 text-slate-400" />
            <span>Profile</span>
          </button>
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button type="button" onClick={() => setIsDropdownOpen(false)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50">
            <LogOut className="size-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      <button type="button" onClick={() => setIsDropdownOpen((value) => !value)} className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-slate-50">
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm">A</div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
          <p className="truncate text-[11px] text-slate-400 capitalize">{user.role}</p>
        </div>
        <ChevronDown className={cn('size-4 flex-shrink-0 text-slate-400 transition-transform duration-200', isDropdownOpen ? 'rotate-180' : '')} />
      </button>
    </SidebarFooter>
  )
}

function MentorSidebarFooter() {
  const { state } = useSidebar()
  const isMinimized = state === 'collapsed'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const user = {
    name: 'Mentor',
    email: 'mentor@doscom.id',
    role: 'Mentor',
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDropdownOpen(false)
    }
  }

  if (isMinimized) {
    return (
      <SidebarFooter className="flex-shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          className="mx-auto flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm transition-all hover:shadow-blue-200"
          aria-label={user.name}>
          M
        </button>
      </SidebarFooter>
    )
  }

  return (
    <SidebarFooter className="relative flex-shrink-0 border-t border-slate-100 p-0" onBlur={handleBlur}>
      {isDropdownOpen && (
        <div className="absolute right-3 bottom-full left-3 z-10 mb-1 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg duration-150 animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <User className="size-4 text-slate-400" />
            <span>Profile</span>
          </button>
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button type="button" onClick={() => setIsDropdownOpen(false)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50">
            <LogOut className="size-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      <button type="button" onClick={() => setIsDropdownOpen((value) => !value)} className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-slate-50">
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm">M</div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
          <p className="truncate text-[11px] text-slate-400 capitalize">{user.role}</p>
        </div>
        <ChevronDown className={cn('size-4 flex-shrink-0 text-slate-400 transition-transform duration-200', isDropdownOpen ? 'rotate-180' : '')} />
      </button>
    </SidebarFooter>
  )
}

function AdminSidebar() {
  const { state } = useSidebar()
  const adminNavigation = Navigation.Admin
  const isMinimized = state === 'collapsed'
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openFlyout = useCallback((event: MouseEvent<HTMLButtonElement>, item: NavItem) => {
    if (!item.children) return
    clearTimeout(flyoutTimer.current)
    const rect = event.currentTarget.getBoundingClientRect()
    setFlyout({ name: item.name, items: item.children, top: rect.top })
  }, [])

  const closeFlyout = useCallback(() => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120)
  }, [])

  const keepFlyout = useCallback(() => {
    clearTimeout(flyoutTimer.current)
  }, [])

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white transition-all duration-300 ease-in-out [&_[data-slot=sidebar-inner]]:bg-white">
        <SidebarHeader className="p-0">
          <SidebarBrand />
        </SidebarHeader>

        <SidebarContent className="flex-1 gap-0 overflow-y-auto py-4 group-data-[collapsible=icon]:px-2 group-data-[state=expanded]:px-3">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0 space-y-2">
                {adminNavigation.map((item) => {
                  if (isMinimized && item.children) {
                    return <SidebarMinimizedGroup key={item.name} item={item} onMouseEnter={(event) => openFlyout(event, item)} onMouseLeave={closeFlyout} />
                  }

                  if (isMinimized) {
                    return <SidebarMinimizedItem key={item.name} item={item} />
                  }

                  if (item.children) {
                    return <SidebarNavGroup key={item.name} item={item} />
                  }

                  return <SidebarNavItem key={item.path ?? item.name} item={item} />
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <AdminSidebarFooter />
      </Sidebar>

      {flyout && isMinimized && <SidebarFlyout flyout={flyout} onMouseEnter={keepFlyout} onMouseLeave={closeFlyout} onNavigate={() => setFlyout(null)} />}
    </>
  )
}

function MentorSidebar() {
  const { state } = useSidebar()
  const mentorNavigation = Navigation.Mentor
  const isMinimized = state === 'collapsed'
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openFlyout = useCallback((event: MouseEvent<HTMLButtonElement>, item: NavItem) => {
    if (!item.children) return
    clearTimeout(flyoutTimer.current)
    const rect = event.currentTarget.getBoundingClientRect()
    setFlyout({ name: item.name, items: item.children, top: rect.top })
  }, [])

  const closeFlyout = useCallback(() => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120)
  }, [])

  const keepFlyout = useCallback(() => {
    clearTimeout(flyoutTimer.current)
  }, [])

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white transition-all duration-300 ease-in-out [&_[data-slot=sidebar-inner]]:bg-white">
        <SidebarHeader className="p-0">
          <SidebarBrand />
        </SidebarHeader>

        <SidebarContent className="flex-1 gap-0 overflow-y-auto py-4 group-data-[collapsible=icon]:px-2 group-data-[state=expanded]:px-3">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0 space-y-2">
                {mentorNavigation.map((item) => {
                  if (isMinimized && item.children) {
                    return <SidebarMinimizedGroup key={item.name} item={item} onMouseEnter={(event) => openFlyout(event, item)} onMouseLeave={closeFlyout} />
                  }

                  if (isMinimized) {
                    return <SidebarMinimizedItem key={item.name} item={item} />
                  }

                  if (item.children) {
                    return <SidebarNavGroup key={item.name} item={item} />
                  }

                  return <SidebarNavItem key={item.path ?? item.name} item={item} />
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <MentorSidebarFooter />
      </Sidebar>

      {flyout && isMinimized && <SidebarFlyout flyout={flyout} onMouseEnter={keepFlyout} onMouseLeave={closeFlyout} onNavigate={() => setFlyout(null)} />}
    </>
  )
}

function StudentSidebarFooter() {
  const { state } = useSidebar()
  const isMinimized = state === 'collapsed'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const user = {
    name: 'Student',
    email: 'student@doscom.id',
    role: 'Student',
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDropdownOpen(false)
    }
  }

  if (isMinimized) {
    return (
      <SidebarFooter className="flex-shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          className="mx-auto flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm transition-all hover:shadow-blue-200"
          aria-label={user.name}>
          S
        </button>
      </SidebarFooter>
    )
  }

  return (
    <SidebarFooter className="relative flex-shrink-0 border-t border-slate-100 p-0" onBlur={handleBlur}>
      {isDropdownOpen && (
        <div className="absolute right-3 bottom-full left-3 z-10 mb-1 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg duration-150 animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <User className="size-4 text-slate-400" />
            <span>Profile</span>
          </button>
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button type="button" onClick={() => setIsDropdownOpen(false)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50">
            <LogOut className="size-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      <button type="button" onClick={() => setIsDropdownOpen((value) => !value)} className="flex w-full items-center gap-3 p-4 transition-colors hover:bg-slate-50">
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm">S</div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-[11px] text-slate-400">{user.email}</p>
          <p className="truncate text-[11px] text-slate-400 capitalize">{user.role}</p>
        </div>
        <ChevronDown className={cn('size-4 flex-shrink-0 text-slate-400 transition-transform duration-200', isDropdownOpen ? 'rotate-180' : '')} />
      </button>
    </SidebarFooter>
  )
}

function StudentSidebar() {
  const { state } = useSidebar()
  const studentNavigation = Navigation.Student
  const isMinimized = state === 'collapsed'
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openFlyout = useCallback((event: MouseEvent<HTMLButtonElement>, item: NavItem) => {
    if (!item.children) return
    clearTimeout(flyoutTimer.current)
    const rect = event.currentTarget.getBoundingClientRect()
    setFlyout({ name: item.name, items: item.children, top: rect.top })
  }, [])

  const closeFlyout = useCallback(() => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120)
  }, [])

  const keepFlyout = useCallback(() => {
    clearTimeout(flyoutTimer.current)
  }, [])

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white transition-all duration-300 ease-in-out [&_[data-slot=sidebar-inner]]:bg-white">
        <SidebarHeader className="p-0">
          <SidebarBrand />
        </SidebarHeader>

        <SidebarContent className="flex-1 gap-0 overflow-y-auto py-4 group-data-[collapsible=icon]:px-2 group-data-[state=expanded]:px-3">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0 space-y-2">
                {studentNavigation.map((item) => {
                  if (isMinimized && item.children) {
                    return <SidebarMinimizedGroup key={item.name} item={item} onMouseEnter={(event) => openFlyout(event, item)} onMouseLeave={closeFlyout} />
                  }

                  if (isMinimized) {
                    return <SidebarMinimizedItem key={item.name} item={item} />
                  }

                  if (item.children) {
                    return <SidebarNavGroup key={item.name} item={item} />
                  }

                  return <SidebarNavItem key={item.path ?? item.name} item={item} />
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <StudentSidebarFooter />
      </Sidebar>

      {flyout && isMinimized && <SidebarFlyout flyout={flyout} onMouseEnter={keepFlyout} onMouseLeave={closeFlyout} onNavigate={() => setFlyout(null)} />}
    </>
  )
}

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '5rem',
        } as CSSProperties
      }>
      <AdminSidebar />

      <main className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </SidebarProvider>
  )
}

export function MentorSidebarProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '5rem',
        } as CSSProperties
      }>
      <MentorSidebar />

      <main className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </SidebarProvider>
  )
}

export function StudentSidebarProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '5rem',
        } as CSSProperties
      }>
      <StudentSidebar />

      <main className="flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </SidebarProvider>
  )
}
export { AdminSidebar, MentorSidebar, StudentSidebar }
