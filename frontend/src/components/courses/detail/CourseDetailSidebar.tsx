import type { ReactNode } from 'react'
import { Play, Monitor, Infinity as InfinityIcon, Award } from 'lucide-react'

import { detailLayout } from '@/lib/course-detail/detail-layout'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface IncludeItem {
  icon: ReactNode
  label: string
}

interface CourseDetailSidebarProps {
  previewImage?: string
  price: string
  strikePrice?: string
  discountLabel?: string
  children: ReactNode
  includes?: IncludeItem[]
  className?: string
}

const defaultIncludes: IncludeItem[] = [
  { icon: <Monitor className="h-4 w-4 text-slate-400" aria-hidden />, label: 'Video on-demand' },
  {
    icon: <InfinityIcon className="h-4 w-4 text-slate-400" aria-hidden />,
    label: 'Akses selamanya',
  },
  { icon: <Award className="h-4 w-4 text-slate-400" aria-hidden />, label: 'Sertifikat penyelesaian' },
]

export function CourseDetailSidebar({
  previewImage,
  price,
  strikePrice,
  discountLabel,
  children,
  includes = defaultIncludes,
  className,
}: CourseDetailSidebarProps) {
  return (
    <aside className={cn(detailLayout.sectionCard, 'overflow-hidden', className)}>
      <div className="relative aspect-video w-full bg-slate-100">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Pratinjau kursus"
            loading="lazy"
            className="h-full w-full object-cover"
            sizes="(max-width: 1024px) 100vw, 380px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-50 to-slate-100 text-slate-300">
            <Play className="h-12 w-12" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={detailLayout.price}>{price}</span>
            {strikePrice ? <span className={detailLayout.strikePrice}>{strikePrice}</span> : null}
          </div>
          {discountLabel ? <p className={detailLayout.discount}>{discountLabel}</p> : null}
        </div>

        <div className="flex flex-col gap-2 [&_button]:min-h-11 [&_button]:w-full [&_button]:rounded-xl [&_button]:text-sm [&_button]:font-semibold">
          {children}
        </div>

        <Separator className="my-1" />

        <div className="flex flex-col gap-2.5">
          <h3 className={detailLayout.sectionTitle}>Yang termasuk dalam kursus</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
            {includes.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
