import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationProps } from '@/lib/types/components/ui'

export type { PaginationProps }

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
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
    <div className="flex items-center justify-center gap-3 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        aria-label="Previous page">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative flex items-center p-1.5 rounded-xl bg-slate-100 border border-slate-200/50  w-max shadow-inner">
        <div
          className="absolute bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/60 transition-all duration-300 ease-in-out"
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
              className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                isActive ? 'font-bold text-primary' : 'font-medium text-slate-500 hover:text-slate-800'
              }`}>
              {i + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        aria-label="Next page">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
