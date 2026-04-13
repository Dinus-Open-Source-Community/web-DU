import { BadgeVariant } from '@/lib/types'
import { statusLabels, statusStyles } from '@/lib/dummyData'
import type { PaymentStatus } from '@/lib/types'

// Course badge variants
const courseBadgeData: Record<BadgeVariant, { label: string; styles: string }> = {
  free: {
    label: 'Free',
    styles: 'bg-[#DCF8DA] text-[#54CD4C]',
  },
  premium: {
    label: 'Premium',
    styles: 'bg-[#E2F7FF] text-[#2290DF]',
  },
  event: {
    label: 'Event',
    styles: 'bg-[#D8DEFF] text-[#B922DF]',
  },
  draft: {
    label: 'Draft',
    styles: 'bg-gray-100 text-gray-600',
  },
}

// Badge component with unified variant support
interface CourseCourseBadgeProps {
  type?: 'course'
  variant: BadgeVariant
}

interface PaymentBadgeProps {
  type: 'payment'
  status: PaymentStatus
}

type BadgeProps = CourseCourseBadgeProps | PaymentBadgeProps

function Badge(props: BadgeProps) {
  // Course badge (default type)
  if (props.type === undefined || props.type === 'course') {
    const courseProps = props as CourseCourseBadgeProps
    const config = courseBadgeData[courseProps.variant]

    if (!config) {
      console.error(`Invalid Badge variant: ${courseProps.variant}`)
      return null
    }

    return <span className={`inline-flex items-center justify-center rounded-[9px] px-3 py-1 text-sm leading-[1.3] font-medium ${config.styles}`}>{config.label}</span>
  }

  // Payment status badge
  if (props.type === 'payment') {
    const paymentProps = props as PaymentBadgeProps
    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[paymentProps.status]}`}>
        {statusLabels[paymentProps.status]}
      </span>
    )
  }

  return null
}

export { Badge }
export type { BadgeProps }
