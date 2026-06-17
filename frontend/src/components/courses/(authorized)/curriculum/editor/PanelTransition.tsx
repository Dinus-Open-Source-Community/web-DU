import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { editMotion, panelSlideClass, type PanelSlideDirection } from '@/lib/course-edit/edit-motion'

type PanelTransitionProps = {
  panelKey: string
  direction?: PanelSlideDirection
  className?: string
  children: ReactNode
}

export function PanelTransition({
  panelKey,
  direction = 'bottom',
  className,
  children,
}: PanelTransitionProps) {
  return (
    <div
      key={panelKey}
      className={cn(
        editMotion.panel,
        panelSlideClass(direction),
        editMotion.reducedMotion,
        className,
      )}
    >
      {children}
    </div>
  )
}
