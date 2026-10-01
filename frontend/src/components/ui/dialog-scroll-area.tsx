import type { ComponentPropsWithoutRef } from 'react'

import {
  handleDialogTouchScrollBubble,
  handleDialogWheelScroll,
} from '@/lib/dialog-scroll'
import { cn } from '@/lib/utils'

type DialogScrollAreaProps = ComponentPropsWithoutRef<'div'>

export function DialogScrollArea({ className, children, ...props }: DialogScrollAreaProps) {
  return (
    <div
      data-slot="dialog-scroll-area"
      className={cn(
        'min-h-0 touch-pan-y overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]',
        className,
      )}
      onWheel={handleDialogWheelScroll}
      onTouchMove={handleDialogTouchScrollBubble}
      {...props}
    >
      {children}
    </div>
  )
}
