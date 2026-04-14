'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { FlyoutState } from './types'

interface SidebarFlyoutProps {
  flyout: FlyoutState
  onMouseEnter: () => void
  onMouseLeave: () => void
  onNavigate: () => void
}

export function SidebarFlyout({
  flyout,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: SidebarFlyoutProps) {
  const pathname = usePathname()

  return (
    <div
      style={{ top: flyout.top, left: 88 }}
      className="fixed z-[60] bg-white rounded-xl shadow-xl border border-slate-100 py-2 min-w-[192px] animate-in fade-in slide-in-from-left-1 duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Group label */}
      <div className="px-4 py-2 mb-1 border-b border-slate-100">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          {flyout.name}
        </span>
      </div>

      <ul className="px-2 space-y-0.5">
        {flyout.items.map((child) => {
          const isActive =
            pathname === child.path || pathname.startsWith(child.path + '/')

          return (
            <li key={child.path}>
              <Link href={child.path} onClick={onNavigate} className="block">
                <div
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      isActive ? 'bg-[#0a84dc]' : 'bg-slate-300',
                    )}
                  />
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
