import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** @deprecated Semua variant memakai token app shell (ink/paper). */
  variant?: 'default' | 'admin'
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const activeIndex = currentPage - 1
    const activeTab = tabsRef.current[activeIndex]
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-lg border-2 border-ink-900/10 bg-paper-white p-2 text-ink-600 transition-all hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman sebelumnya">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative flex w-max items-center rounded-lg border-2 border-ink-900/10 bg-paper-paper p-1.5">
        <div
          className="absolute rounded-md border-2 border-ink-900/10 bg-paper-white shadow-paper transition-all duration-300 ease-in-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: '6px',
            bottom: '6px',
            opacity: indicatorStyle.width > 0 ? 1 : 0,
          }}
        />

        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = currentPage === i + 1
          return (
            <button
              key={i}
              ref={(el) => {
                tabsRef.current[i] = el
              }}
              onClick={() => onPageChange(i + 1)}
              className={cn(
                'relative z-10 flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                isActive
                  ? 'font-bold text-ink-900'
                  : 'font-medium text-ink-500 hover:text-ink-800',
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-lg border-2 border-ink-900/10 bg-paper-white p-2 text-ink-600 transition-all hover:bg-paper-paper disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Halaman berikutnya">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
