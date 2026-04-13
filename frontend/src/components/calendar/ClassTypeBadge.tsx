import { ClassType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getTypeStyles } from './eventUtils'

interface ClassTypeBadgeProps {
  classType: ClassType
  className?: string
}

export default function ClassTypeBadge({ classType, className }: ClassTypeBadgeProps) {
  return <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', getTypeStyles(classType), className)}>{classType}</span>
}
