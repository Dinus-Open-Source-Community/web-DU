'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem, NavChildItem } from './types'

// ─── Sub-item with dot indicator ─────────────────────────────────────────────

function SubItem({ child, onClose }: { child: NavChildItem; onClose: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === child.path || pathname.startsWith(child.path + '/')

  return (
    <Link href={child.path} onClick={onClose} className="block">
      <div
        className={cn(
          'relative flex items-center gap-3 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 cursor-pointer',
          isActive
            ? 'text-blue-700 bg-blue-50 font-medium'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
        )}
      >
        <span
          className={cn(
            'flex-shrink-0 w-[7px] h-[7px] rounded-full transition-all duration-150',
            isActive
              ? 'bg-[#0a84dc] shadow-[0_0_0_2px_rgba(10,132,220,0.2)]'
              : 'bg-slate-300',
          )}
        />
        {child.name}
      </div>
    </Link>
  )
}

// ─── Collapsible group ───────────────────────────────────────────────────────

interface SidebarNavGroupProps {
  item: NavItem
  onClose: () => void
}

export function SidebarNavGroup({ item, onClose }: SidebarNavGroupProps) {
  const pathname = usePathname()
  const isChildActive =
    item.children?.some(
      (c) => pathname === c.path || pathname.startsWith(c.path + '/'),
    ) ?? false

  const [isOpen, setIsOpen] = useState(isChildActive)
  const Icon = item.icon

  return (
    <li className="flex flex-col">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'group flex items-center justify-between w-full px-3.5 py-[9px] rounded-xl text-sm font-medium transition-all duration-150',
          isChildActive
            ? 'text-blue-700 bg-blue-50'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={cn(
                'w-[18px] h-[18px] flex-shrink-0 transition-colors',
                isChildActive
                  ? 'text-[#0a84dc]'
                  : 'text-slate-400 group-hover:text-slate-600',
              )}
            />
          )}
          <span>{item.name}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform duration-300',
            isOpen ? 'rotate-180' : '',
            isChildActive ? 'text-blue-400' : 'text-slate-400',
          )}
        />
      </button>

      {/* Animated sub-menu */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-1 ml-[22px] pl-4 pb-1 border-l-2 border-blue-200/70 space-y-0.5">
            {item.children?.map((child) => (
              <SubItem key={child.path} child={child} onClose={onClose} />
            ))}
          </div>
        </div>
      </div>
    </li>
  )
}
