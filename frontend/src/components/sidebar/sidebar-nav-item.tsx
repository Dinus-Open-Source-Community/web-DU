'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from './types'

interface SidebarNavItemProps {
  item: NavItem
  onClose: () => void
}

export function SidebarNavItem({ item, onClose }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.path
  const Icon = item.icon

  return (
    <li>
      <Link href={item.path!} onClick={onClose} className="block">
        <div
          className={cn(
            'group flex items-center gap-3 px-3.5 py-[9px] rounded-xl text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-[#0a84dc] text-white shadow-sm shadow-blue-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                'w-[18px] h-[18px] flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600',
              )}
            />
          )}
          <span>{item.name}</span>
        </div>
      </Link>
    </li>
  )
}
