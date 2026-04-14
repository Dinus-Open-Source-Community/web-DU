'use client'

import Link from 'next/link'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoDu } from '@/components/ui/icons'

interface SidebarBrandProps {
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function SidebarBrand({ isMinimized, onToggleMinimize }: SidebarBrandProps) {
  return (
    <div className={cn('relative flex h-16 items-center border-b border-slate-100 flex-shrink-0', isMinimized ? 'justify-center px-0' : 'px-5 gap-3')}>
      <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        {!isMinimized && (
          <div className="leading-none overflow-hidden  text-center">
            <span className="text-xl font-bold text-primary whitespace-nowrap pr-2">Doscom</span>
            <span className="text-base text-gray-500 font-medium">University</span>
          </div>
        )}
      </Link>

      {/* Collapse / Expand toggle (desktop only) */}
      <button
        onClick={onToggleMinimize}
        className="hidden lg:flex absolute -right-3 top-[22px] items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-[#0a84dc] hover:border-blue-300 transition-all z-10"
        aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}>
        {isMinimized ? <ChevronsRight className="w-3 h-3" /> : <ChevronsLeft className="w-3 h-3" />}
      </button>
    </div>
  )
}
