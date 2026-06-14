import type { ReactNode } from 'react'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { cn } from '@/lib/utils'

type CourseDetailMobileCtaProps = {
  price: string
  strikePrice?: string
  discountLabel?: string
  children: ReactNode
  className?: string
}

export function CourseDetailMobileCta({
  price,
  strikePrice,
  discountLabel,
  children,
  className,
}: CourseDetailMobileCtaProps) {
  return (
    <div className={cn(detailLayout.stickyBar, className)}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={detailLayout.price}>{price}</span>
            {strikePrice ? <span className={detailLayout.strikePrice}>{strikePrice}</span> : null}
          </div>
          {discountLabel ? <p className={detailLayout.discount}>{discountLabel}</p> : null}
        </div>

        <div className="shrink-0 [&_a]:min-w-[9.5rem] [&_button]:min-h-11 [&_button]:rounded-xl [&_button]:px-5 [&_button]:text-sm [&_button]:font-semibold">
          {children}
        </div>
      </div>
    </div>
  )
}
