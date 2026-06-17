import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { editLayout } from '@/lib/course-edit/edit-layout'
import { editMotion } from '@/lib/course-edit/edit-motion'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(editLayout.segmented, className)}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              editLayout.segmentedItem,
              editMotion.reducedMotion,
              isActive ? editLayout.segmentedItemActive : editLayout.segmentedItemIdle,
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
