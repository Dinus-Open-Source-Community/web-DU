import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'h-9 w-full min-w-0 px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm',
  {
    variants: {
      variant: {
        default:
          'rounded-xl border border-input bg-card transition-[color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-line-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        auth: 'rounded-xl border-2 border-ink-900 bg-paper-white text-foreground shadow-button transition-all placeholder:text-muted-foreground hover:shadow-button-pressed focus:border-ink-900 focus:shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Input({
  className,
  type,
  variant = 'default',
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
