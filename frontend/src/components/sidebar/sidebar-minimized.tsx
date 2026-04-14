'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Tooltip from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import type { NavItem } from './types'

// ─── Single minimized icon with tooltip ──────────────────────────────────────

interface MinimizedItemProps {
  item: NavItem
  onClose: () => void
}

export function SidebarMinimizedItem({ item, onClose }: MinimizedItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.path
  const Icon = item.icon

  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link href={item.path!} onClick={onClose} className="block">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-[#0a84dc] text-white shadow-sm shadow-blue-300'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
              )}
            >
              {Icon && <Icon className="w-[18px] h-[18px]" />}
            </div>
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={12}
            className="z-[70] bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg select-none"
          >
            {item.name}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

// ─── Group button for minimized sidebar (triggers flyout) ────────────────────

interface MinimizedGroupProps {
  item: NavItem
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: () => void
}

export function SidebarMinimizedGroup({
  item,
  onMouseEnter,
  onMouseLeave,
}: MinimizedGroupProps) {
  const pathname = usePathname()
  const isChildActive =
    item.children?.some(
      (c) => pathname === c.path || pathname.startsWith(c.path + '/'),
    ) ?? false
  const Icon = item.icon

  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150',
        isChildActive
          ? 'bg-blue-50 text-[#0a84dc]'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
      )}
    >
      {Icon && <Icon className="w-[18px] h-[18px]" />}
    </button>
  )
}
