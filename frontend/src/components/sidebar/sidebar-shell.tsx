'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { NavItem, FlyoutState } from './types'
import { SidebarBrand } from './sidebar-brand'
import { SidebarNavItem } from './sidebar-nav-item'
import { SidebarNavGroup } from './sidebar-nav-group'
import { SidebarMinimizedItem, SidebarMinimizedGroup } from './sidebar-minimized'
import { SidebarFlyout } from './sidebar-flyout'
import { SidebarUser } from './sidebar-user'
import { useSidebarSession } from './sidebar-session-context'

interface SidebarProps {
  navigation: NavItem[]
  isOpen: boolean
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function Sidebar({ navigation, isOpen, onClose, isMinimized, onToggleMinimize }: SidebarProps) {
  const { user, onLogout, onProfile } = useSidebarSession()
  const [flyout, setFlyout] = useState<FlyoutState | null>(null)
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const openFlyout = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (!item.children) return
    clearTimeout(flyoutTimer.current)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
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
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out',
          isMinimized ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0 w-64!' : '-translate-x-full lg:translate-x-0',
        )}>
        {/* Brand */}
        <SidebarBrand isMinimized={isMinimized && !isOpen} onToggleMinimize={onToggleMinimize} />

        {/* Navigation */}
        <nav className={cn('flex-1 py-4 overflow-y-auto', isMinimized && !isOpen ? 'px-2' : 'px-3')}>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const effectiveMinimized = isMinimized && !isOpen

              // Minimized + has children → group button with flyout
              if (effectiveMinimized && item.children) {
                return (
                  <li key={item.name}>
                    <SidebarMinimizedGroup item={item} onMouseEnter={(e) => openFlyout(e, item)} onMouseLeave={closeFlyout} />
                  </li>
                )
              }

              // Minimized + no children → icon with tooltip
              if (effectiveMinimized && !item.children) {
                return (
                  <li key={item.name}>
                    <SidebarMinimizedItem item={item} onClose={onClose} />
                  </li>
                )
              }

              // Expanded + has children → collapsible group
              if (item.children) {
                return <SidebarNavGroup key={item.name} item={item} onClose={onClose} />
              }

              // Expanded + no children → plain nav link
              return <SidebarNavItem key={item.name} item={item} onClose={onClose} />
            })}
          </ul>
        </nav>

        {/* User profile footer */}
        <SidebarUser isMinimized={isMinimized && !isOpen} user={user} onLogout={onLogout} onProfile={onProfile} />
      </aside>

      {/* Flyout panel for minimized groups */}
      {flyout && isMinimized && !isOpen && <SidebarFlyout flyout={flyout} onMouseEnter={keepFlyout} onMouseLeave={closeFlyout} onNavigate={() => setFlyout(null)} />}
    </>
  )
}
