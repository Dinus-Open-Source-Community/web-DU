'use client'
import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DataCourse } from '@/lib/dummyData'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'

// Mock categories that will come from backend response
const DUMMY_CATEGORIES = ['Pengembangan Web', 'Desain UI/UX', 'Data Science & AI', 'Bisnis & Manajemen', 'Cybersecurity']

const ITEMS_PER_PAGE = 6

const Section = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  // Process filter
  const filteredCourses = DataCourse.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase())

    const categoryHit = selectedCategories.length === 0 || (course.category && selectedCategories.includes(course.category))

    return matchesSearch && categoryHit
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <section className="px-8 py-10 w-full flex flex-col gap-10">
      {/* Header & Search */}
      <div className="flex flex-col  justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Katalog Kursus</h1>
          <p className="text-slate-500 font-medium text-sm">Eksplorasi materi terbaik untuk tingkatkan keahlian Anda secara profesional.</p>
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

      {/* Content Area dengan Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Sidebar Filter */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          <div className="sticky top-10 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="font-semibold text-slate-800 mb-5 px-1 text-sm uppercase tracking-wide">Kategori</h3>
            <div className="flex flex-col gap-3.5 px-1">
              {DUMMY_CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat)
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-200 ${
                        isChecked ? 'bg-primary border-primary shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'border-slate-300 bg-white group-hover:border-primary/50'
                      }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${isChecked ? 'font-medium text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
                      }}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 w-full min-w-0">
          {filteredCourses.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div
                key={`${selectedCategories.join(',')}-${searchQuery}-${currentPage}`}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
                {paginatedCourses.map((course, idx) => (
                  <Card
                    key={`${course.title}-${idx}`}
                    variant="course"
                    title={course.title}
                    description={course.description}
                    image={course.image}
                    variantBadge={course.variantBadge}
                    author={course.author}
                    rating={course.rating}
                    totalReviews={course.totalReviews}
                  />
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 border border-slate-100 rounded-3xl animate-in fade-in zoom-in duration-500">
              <EmptyCourseIcon className="w-40 h-40 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ups, hasil tidak ditemukan</h3>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Kami tidak menemukan kursus yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Section
