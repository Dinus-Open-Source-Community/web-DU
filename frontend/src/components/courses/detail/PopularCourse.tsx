import { useEffect, useMemo, useState } from 'react'

import CardCourse from '@/components/shared/CardCourse'
import { Pagination } from '@/components/shared/Pagination'
import { detailLayout } from '@/lib/course-detail/detail-layout'
import type { ICourseItem } from '@/lib/types/course'
import { cn } from '@/lib/utils'

interface PopularCoursesStripProps {
  title?: string
  items: ICourseItem[]
  baseHref?: string
  className?: string
  itemsPerPage?: number
}

function useResponsiveItemsPerPage(fallback = 3) {
  const [itemsPerPage, setItemsPerPage] = useState(fallback)

  useEffect(() => {
    const mediaSm = window.matchMedia('(min-width: 640px)')
    const mediaLg = window.matchMedia('(min-width: 1024px)')

    const updateItemsPerPage = () => {
      if (mediaLg.matches) {
        setItemsPerPage(3)
        return
      }

      if (mediaSm.matches) {
        setItemsPerPage(2)
        return
      }

      setItemsPerPage(1)
    }

    updateItemsPerPage()
    mediaSm.addEventListener('change', updateItemsPerPage)
    mediaLg.addEventListener('change', updateItemsPerPage)

    return () => {
      mediaSm.removeEventListener('change', updateItemsPerPage)
      mediaLg.removeEventListener('change', updateItemsPerPage)
    }
  }, [])

  return itemsPerPage
}

export function PopularCoursesStrip({
  title = 'Kursus populer',
  items,
  className,
  itemsPerPage: itemsPerPageOverride,
}: PopularCoursesStripProps) {
  const responsiveItemsPerPage = useResponsiveItemsPerPage()
  const itemsPerPage = itemsPerPageOverride ?? responsiveItemsPerPage
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage

    return items.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, items, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages))
    }
  }, [currentPage, totalPages])

  if (items.length === 0) return null

  return (
    <section className={cn(detailLayout.sectionCard, detailLayout.sectionPadding, className)}>
      <h2 className={cn(detailLayout.sectionTitle, 'mb-5')}>{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
