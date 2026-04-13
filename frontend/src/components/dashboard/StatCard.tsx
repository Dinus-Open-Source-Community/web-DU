import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statCardVariants = cva('rounded-2xl border border-slate-100 bg-white flex items-center justify-between', {
  variants: {
    variant: {
      default: 'w-72 h-32 p-6 mt-5',
      compact: 'p-6 shadow-2xs',
      legacy: 'w-72 h-32 p-6 mt-5 border-gray-400',
    },
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title?: string
  label?: string
  value: string | number
  icon?: ReactNode
  themeIcon?: string
  colorClass?: string
  bgClass?: string
}

export default function StatCard({ title, label, value, icon, themeIcon, variant, size, colorClass, bgClass }: StatCardProps) {
  const displayLabel = label || title
  const isLucideIcon = icon && typeof icon === 'function'

  return (
    <div className={cn(statCardVariants({ variant, size }))}>
      <div className="flex flex-col">
        <span className={cn('font-semibold uppercase tracking-wider mb-1', variant === 'legacy' ? 'text-lg text-gray-500' : 'text-xs text-slate-400')}>{displayLabel}</span>
        <span className={cn('font-bold', variant === 'legacy' ? 'text-xl text-gray-800' : 'text-2xl text-slate-900')}>{value}</span>
      </div>
      {icon && <div className={cn('rounded-xl flex items-center justify-center shrink-0', variant === 'legacy' ? `p-2 bg-blue-100 ${themeIcon}` : `w-11 h-11 bg-primary/10 text-primary`)}>{icon}</div>}
    </div>
  )
}
