'use client'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { getResumeCourses, listCourses } from '@/lib/data/repository'
import { isMockDataEnabled } from '@/lib/config/mock-data'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { SegmentedFilter } from '@/components/ui/SegmentedFilter'

const filters = ['Semua', 'Sedang Berjalan', 'Baru', 'Selesai'] as const
const ITEMS_PER_PAGE = 6

const Section = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Semua')
  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchApplied])

  const mock = isMockDataEnabled()
  const resumed = mock
    ? getResumeCourses().map((c) => ({
        ...c,
        simulatedProgress: c.progress,
        type: 'resume' as const,
      }))
    : []

  const newCourses = mock
    ? listCourses().map((c) => ({
        ...c,
        simulatedProgress: 0,
        type: 'course' as const,
      }))
    : []

  const courses = [...resumed, ...newCourses]

  const filteredCourses = courses.filter((course) => {
    const q = searchApplied.trim().toLowerCase()
    if (q) {
      const inTitle = course.title.toLowerCase().includes(q)
      const inDesc = course.description?.toLowerCase().includes(q) ?? false
      if (!inTitle && !inDesc) return false
    }

    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Sedang Berjalan') return course.simulatedProgress > 0 && course.simulatedProgress < 100
    if (activeFilter === 'Baru') return course.simulatedProgress === 0
    if (activeFilter === 'Selesai') return course.simulatedProgress === 100
    return true
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <section className="flex w-full flex-col gap-8 px-8 py-10">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Kursus Saya</h1>
          <p className="text-sm font-medium text-slate-500">Lanjutkan pembelajaran Anda untuk mencapai tujuan karir dan raih sertifikat.</p>
        </div>

        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchApplied(searchInput)}
          placeholder="Cari kursus..."
        />
      </div>

      <SegmentedFilter
        items={filters.map((f) => ({ value: f, label: f }))}
        value={activeFilter}
        onChange={setActiveFilter}
        variant="scroll"
      />

      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course, idx) => {
              const isInProgress = course.simulatedProgress > 0 && course.simulatedProgress < 100

              return (
                <Card
                  key={`${course.title}-${idx}`}
                  variant={course.type as 'resume' | 'course'}
                  title={course.title}
                  description={course.description}
                  image={course.image}
                  progress={isInProgress || course.simulatedProgress === 100 ? course.simulatedProgress : undefined}
                  module={'module' in course ? (course as { module?: string }).module : undefined}
                  variantBadge={course.variantBadge}
                  author={course.author}
                  rating={course.rating}
                  totalReviews={course.totalReviews}
                  resumeDetailHref={
                    course.type === 'resume' && 'courseUid' in course && (course as { courseUid?: string }).courseUid
                      ? `/student/learning/${(course as { courseUid: string }).courseUid}`
                      : undefined
                  }
                />
              )
            })}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <EmptyCourseIcon className="mb-6 h-48 w-48" />
          <h3 className="mb-2 text-xl font-bold text-slate-900">Ups, belum ada kursus</h3>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">Sepertinya list yang Anda cari kosong. Coba ubah filter kategori pencarian Anda.</p>
        </div>
      )}
    </section>
  )
}

export default Section
