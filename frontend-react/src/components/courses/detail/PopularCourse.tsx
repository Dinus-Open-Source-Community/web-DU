import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import CardCourse from '@/components/shared/CardCourse'
import { Pagination } from '@/components/shared/Pagination'
import type { ICourseItem } from '@/lib/types/course'

interface PopularCoursesStripProps {
  title?: string
  items: ICourseItem[]
  baseHref?: string
  className?: string
  itemsPerPage?: number
}

export function PopularCoursesStrip({ title = 'Popular Courses', items, className, itemsPerPage = 3 }: PopularCoursesStripProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(items.length / itemsPerPage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage

    return items.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, items, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [currentPage, totalPages])

  return (
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((item) => (
          <div key={item.uid} className="w-full">
            <CardCourse size="sm" data={item as ICourseItem} />
          </div>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  )
}
