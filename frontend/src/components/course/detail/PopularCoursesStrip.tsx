import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface PopularCourseItem {
  uid: string
  title: string
  image?: string
  rating: number
  price: string
  mentor?: string
}

interface PopularCoursesStripProps {
  title?: string
  items: PopularCourseItem[]
  baseHref?: string
  className?: string
}

export function PopularCoursesStrip({
  title = 'Popular Courses',
  items,
  baseHref = '/course',
  className,
}: PopularCoursesStripProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.uid}
            href={`${baseHref}/${item.uid}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-colors hover:border-slate-300">
            <div className="relative aspect-video w-full bg-slate-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 240px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-50 to-slate-100 text-slate-300 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">
                {item.title}
              </h3>
              {item.mentor && (
                <p className="text-xs text-slate-500">{item.mentor}</p>
              )}
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{item.rating.toFixed(1)}</span>
                </span>
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  {item.price}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
