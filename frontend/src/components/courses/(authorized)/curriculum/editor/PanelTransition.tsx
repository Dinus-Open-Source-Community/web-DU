import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import type { PanelSlideDirection } from '@/lib/course-edit/edit-motion'

type PanelTransitionProps = {
  panelKey?: string
  direction?: PanelSlideDirection
  className?: string
  children: ReactNode
}

export function PanelTransition({
  panelKey,
  className,
  children,
}: PanelTransitionProps) {
  return (
    <div
      key={panelKey}
      className={cn('min-w-0', className)}
    >
      {children}
    </div>
  )
}
