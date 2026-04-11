'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ResumeCourses, DataCourse } from '@/lib/dummyData'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'

const filters = ['Semua', 'Sedang Berjalan', 'Baru', 'Selesai']
const ITEMS_PER_PAGE = 6

const Section = () => {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const activeIndex = filters.indexOf(activeFilter)
    const activeTab = tabsRef.current[activeIndex]
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      })
    }
  }, [activeFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  const resumed = ResumeCourses.map((c) => ({
    ...c,
    simulatedProgress: c.progress,
    type: 'resume',
  }))

  const newCourses = DataCourse.map((c) => ({
    ...c,
    simulatedProgress: 0,
    type: 'course',
  }))

  const courses = [...resumed, ...newCourses]

  const filteredCourses = courses.filter((course) => {
    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Sedang Berjalan') return course.simulatedProgress > 0 && course.simulatedProgress < 100
    if (activeFilter === 'Baru') return course.simulatedProgress === 0
    if (activeFilter === 'Selesai') return course.simulatedProgress === 100
    return true
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <section className="px-8 py-10 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Kursus Saya</h1>
          <p className="text-slate-500 font-medium text-sm">Lanjutkan pembelajaran Anda untuk mencapai tujuan karir dan raih sertifikat.</p>
        </div>

        {/* Search */}
        <div className="flex w-full md:max-w-3xl items-center gap-3 mt-1">
          <div className="relative flex w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari kursus..."
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>
          <button className="px-6 py-3.5 bg-primary w-[20%] text-white font-semibold rounded-xl hover:bg-primary/95 transition-all shrink-0">Cari</button>
        </div>
      </div>

      {/* Filtering  */}
      <div className="relative flex items-center bg-slate-100 p-1.5 shadow-inner rounded-xl w-max">
        <div
          className="absolute bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/50 transition-all duration-300 ease-in-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: '6px',
            bottom: '6px',
            opacity: indicatorStyle.width > 0 ? 1 : 0,
          }}
        />
        {filters.map((filter, index) => (
          <button
            key={filter}
            ref={(el) => {
              tabsRef.current[index] = el
            }}
            onClick={() => setActiveFilter(filter)}
            className={`relative z-10 px-5 py-2 text-sm transition-colors rounded-lg ${activeFilter === filter ? 'font-semibold text-primary' : 'font-medium text-slate-500 hover:text-slate-800'}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* Grid & Pagination Container */}
      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  module={'module' in course ? (course as any).module : undefined}
                  variantBadge={course.variantBadge}
                  author={course.author}
                  rating={course.rating}
                  totalReviews={course.totalReviews}
                />
              )
            })}
          </div>

          {/* Pagination Controls */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <EmptyCourseIcon className="w-48 h-48 mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ups, belum ada kursus</h3>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Sepertinya list yang Anda cari kosong. Coba ubah filter kategori pencarian Anda.</p>
        </div>
      )}
    </section>
  )
}

export default Section
