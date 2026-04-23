'use client'

import { useState, useRef } from 'react'
import { LogOut, User, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Tooltip from '@radix-ui/react-tooltip'
import Image from 'next/image'

interface SidebarUserProps {
  isMinimized: boolean
  user: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  onLogout: () => void
  onProfile: () => void
}

export function SidebarUser({ isMinimized, user, onLogout, onProfile }: SidebarUserProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Close dropdown on outside click
  const handleBlur = (e: React.FocusEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setIsDropdownOpen(false)
    }
  }

  if (isMinimized) {
    return (
      <div className="flex-shrink-0 border-t border-slate-100 p-3 flex justify-center">
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={onProfile}
                className="w-9 h-9 rounded-xl bg-[#0a84dc] text-white text-xs font-bold flex items-center justify-center shadow-sm hover:shadow-blue-200 transition-all overflow-hidden">
                {user.avatar ? <Image src={user.avatar} alt={user.name} width={36} height={36} loading="lazy" className="w-full h-full object-cover" /> : initials}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="right" sideOffset={12} className="z-[70] bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg">
                {user.name}
                <Tooltip.Arrow className="fill-slate-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0 border-t border-slate-100" onBlur={handleBlur}>
      {/* Dropdown menu (opens upward) */}
      {isDropdownOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              onProfile()
            }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <User className="w-4 h-4 text-slate-400" />
            <span>Profile</span>
          </button>
          <div className="mx-3 my-1 border-t border-slate-100" />
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              onLogout()
            }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* User button */}
      <button onClick={() => setIsDropdownOpen((v) => !v)} className="flex items-center gap-3 w-full p-4 hover:bg-slate-50 transition-colors">
        {/* Avatar */}
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-[#0a84dc] text-xs font-bold text-white shadow-sm flex items-center justify-center">
          {user.avatar ? (
            <Image src={user.avatar} alt="" width={36} height={36} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          <p className="text-[11px] text-slate-400 capitalize truncate">{user.role}</p>
        </div>

        {/* Chevron */}
        <ChevronUp className={cn('w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200', isDropdownOpen ? '' : 'rotate-180')} />
      </button>
    </div>
  )
}
