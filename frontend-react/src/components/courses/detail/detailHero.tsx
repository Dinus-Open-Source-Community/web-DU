import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'

interface CourseDetailHeroProps {
  title: string
  description?: string
  category: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
}

export function CourseDetailHero({ title, description, category, backHref = '/admin/courses', backLabel = 'Back to Courses', actions }: CourseDetailHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0a84dc_0%,#075e9c_100%)] text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-8 md:px-8 md:py-10">
        <Breadcrumb className="text-white/85">
          <BreadcrumbList className="text-sm text-white/80">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white/80 hover:text-white">
                <Link to={backHref} className="inline-flex items-center gap-1">
                  <ChevronLeft className="h-5 w-5" /> {backLabel}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">{category}</span>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[40px]">{title}</h1>
          {description && <p className="max-w-3xl text-sm leading-relaxed text-white/85 md:text-base">{description}</p>}
        </div>

        {actions && <div className="mt-1 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </section>
  )
}
