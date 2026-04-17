'use client'

import type { ReactNode } from 'react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface DetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  side?: 'right' | 'left'
  className?: string
  contentClassName?: string
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  className,
  contentClassName,
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn('w-full border-slate-200 p-0 sm:max-w-lg', className)}>
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <SheetTitle className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-slate-500">{description}</SheetDescription>
          )}
        </SheetHeader>
        <div
          className={cn(
            'flex-1 space-y-5 overflow-y-auto px-6 py-5',
            contentClassName
          )}>
          {children}
        </div>
        {footer && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">{footer}</div>
        )}
      </SheetContent>
    </Sheet>
  )
}
