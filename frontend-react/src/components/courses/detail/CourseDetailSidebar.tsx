import type { ReactNode } from 'react'
import { Play, Monitor, Infinity as InfinityIcon, Award } from 'lucide-react'

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
  { icon: <Monitor className="h-4 w-4 text-slate-400" />, label: '42h on-demand video' },
  {
    icon: <InfinityIcon className="h-4 w-4 text-slate-400" />,
    label: 'Full lifetime access',
  },
  { icon: <Award className="h-4 w-4 text-slate-400" />, label: 'Certificate of completion' },
]

export function CourseDetailSidebar({ previewImage, price, strikePrice, discountLabel, children, includes = defaultIncludes, className }: CourseDetailSidebarProps) {
  return (
    <aside className={cn('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      <div className="relative aspect-video w-full bg-slate-100">
        {previewImage ? (
          <img src={previewImage} alt="Preview kursus" loading="lazy" className="object-cover" sizes="(max-width: 1024px) 100vw, 380px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-50 to-slate-100 text-slate-300">
            <Play className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{price}</span>
            {strikePrice && <span className="text-base text-slate-400 line-through">{strikePrice}</span>}
          </div>
          {discountLabel && <p className="text-xs font-medium text-rose-600">{discountLabel}</p>}
        </div>

        <div className="flex flex-col gap-2">{children}</div>

        <Separator className="my-1" />

        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">This course includes</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
            {includes.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50">{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
