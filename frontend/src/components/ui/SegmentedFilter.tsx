'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { SegmentedFilterVariant, SegmentedItem } from '@/lib/types/components/ui'

export type { SegmentedFilterVariant, SegmentedItem }

type SegmentedFilterProps<T extends string> = {
  items: SegmentedItem<T>[]
  value: T
  onChange: (value: T) => void
  variant?: SegmentedFilterVariant
  className?: string
}

export function SegmentedFilter<T extends string>({ items, value, onChange, variant = 'scroll', className }: SegmentedFilterProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  const activeIndex = items.findIndex((t) => t.value === value)

  const updateIndicator = useCallback(() => {
    const activeTab = tabsRef.current[activeIndex]
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }
  }, [activeIndex])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator, items.length])

  useEffect(() => {
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  const showIndicatorSm = variant === 'wrap'

  return (
    <div
      className={cn(
        'relative flex items-center gap-1 rounded-xl bg-slate-100 p-1.5 shadow-inner',
        variant === 'scroll' && 'w-max max-w-full overflow-x-auto',
        variant === 'wrap' && 'w-full max-w-full flex-wrap sm:w-max sm:flex-nowrap',
        className
      )}>
      <div
        className={cn(
          'pointer-events-none absolute rounded-lg border border-slate-200/50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out',
          showIndicatorSm && 'hidden sm:block',
          !showIndicatorSm && 'border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
        )}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          top: 6,
          bottom: 6,
          opacity: indicatorStyle.width > 0 ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const active = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            ref={(el) => {
              tabsRef.current[index] = el
            }}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative z-10 rounded-lg transition-colors',
              variant === 'scroll' && 'whitespace-nowrap px-5 py-2 text-sm',
              variant === 'wrap' && 'px-3 py-2 text-left text-xs sm:px-5 sm:text-sm',
              active ? 'font-semibold text-primary' : 'font-medium text-slate-500 hover:text-slate-800',
              active && variant === 'wrap' && 'bg-white shadow-sm sm:bg-transparent sm:shadow-none'
            )}>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
