import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Input, type inputVariants } from '../ui/input'
import type { VariantProps } from 'class-variance-authority'

export interface GlobalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  subLabel?: string
  rightIcon?: ReactNode
  variant?: VariantProps<typeof inputVariants>['variant']
}

export const GlobalInput = ({ label, subLabel, rightIcon, className, variant = 'default', ...props }: GlobalInputProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label className="text-sm leading-[1.4] font-normal tracking-tight text-foreground">
          {label} {subLabel && <span className="text-xs font-normal text-muted-foreground">{subLabel}</span>}
        </label>
      )}
      <div className="relative">
        <Input
          variant={variant}
          className={
            variant === 'auth'
              ? cn('w-full rounded-xl py-3 text-sm text-foreground placeholder:text-muted-foreground', rightIcon && 'pr-10', className)
              : cn('w-full rounded-xl border-input bg-card py-3 text-sm text-foreground placeholder:text-muted-foreground', rightIcon && 'pr-10', className)
          }
          {...props}
        />
        {rightIcon && <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">{rightIcon}</div>}
      </div>
    </div>
  )
}
