'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { mentorCoursesDummy } from '@/lib/dummyData'
import { getMergedMentorCourses, setMentorCoursePublished } from '@/lib/mentorCourseStorage'
import type { IMentorCourse } from '@/lib/types'
import { CreateCourseDialog } from './CreateCourseDialog'

const filters = ['Semua', 'Aktif', 'Draf'] as const
const ITEMS_PER_PAGE = 6

export default function MentorCoursesSection() {
  const [courses, setCourses] = useState<IMentorCourse[]>(mentorCoursesDummy)
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Semua')
  const [search, setSearch] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const refresh = () => setCourses(getMergedMentorCourses())
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

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
  }, [activeFilter, searchApplied])

  const filteredCourses = useMemo(() => {
    const q = searchApplied.trim().toLowerCase()
    return courses.filter((c) => {
      if (activeFilter === 'Aktif' && !c.published) return false
      if (activeFilter === 'Draf' && c.published) return false
      if (!q) return true
      return c.title.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false) || c.header.toLowerCase().includes(q)
    })
  }, [courses, activeFilter, searchApplied])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const applySearch = () => setSearchApplied(search)

  const handleTogglePublish = (uid: string, currentlyPublished: boolean) => {
    setMentorCoursePublished(uid, !currentlyPublished)
    setCourses(getMergedMentorCourses())
  }

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-5">
          <PageHeader title="Courses" subtitle="Kelola kursus Anda, peserta, dan konten modul." />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-3 md:max-w-3xl md:flex-row md:items-center">
              <div className="relative flex w-full flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  placeholder="Cari kursus..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button type="button" className="h-[46px] shrink-0 rounded-xl px-8 font-semibold md:w-[120px]" onClick={applySearch}>
                Cari
              </Button>
            </div>

            <Button className="h-[46px] shrink-0 gap-2 rounded-xl px-5 font-semibold" onClick={() => setCreateOpen(true)} type="button">
              <Plus className="h-5 w-5" />
              Buat kursus
            </Button>
          </div>
        </div>

        <div className="relative flex w-max max-w-full items-center overflow-x-auto rounded-xl bg-slate-100 p-1.5 shadow-inner">
          <div
            className="pointer-events-none absolute rounded-lg border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out"
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
              type="button"
              ref={(el) => {
                tabsRef.current[index] = el
              }}
              onClick={() => setActiveFilter(filter)}
              className={`relative z-10 whitespace-nowrap rounded-lg px-5 py-2 text-sm transition-colors ${
                activeFilter === filter ? 'font-semibold text-primary' : 'font-medium text-slate-500 hover:text-slate-800'
              }`}>
              {filter}
            </button>
          ))}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedCourses.map((c) => (
                <Card
                  key={c.uid}
                  variant="mentorCourse"
                  title={c.title}
                  description={c.description ?? c.header}
                  image={c.image}
                  mentorHeader={c.header}
                  mentorPublished={c.published}
                  mentorModuleCount={c.moduleCount}
                  mentorStudentCount={c.studentCount}
                  rating={c.rating}
                  totalReviews={c.totalReviews}
                  detailHref={`/mentor/courses/${c.uid}`}
                  mentorAssignmentsHref={`/mentor/courses/${c.uid}/assignments`}
                  mentorOnStatusClick={() => handleTogglePublish(c.uid, c.published)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="flex w-full justify-center pt-2" aria-label="Pagination daftar kursus">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </nav>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <EmptyCourseIcon className="mb-6 h-48 w-48" />
            <h3 className="mb-2 text-xl font-bold text-slate-900">Belum ada kursus</h3>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">Ubah filter atau kata kunci pencarian, atau buat kursus baru.</p>
            <Button className="mt-6 rounded-xl" type="button" onClick={() => setCreateOpen(true)}>
              Buat kursus
            </Button>
          </div>
        )}
      </div>

      <CreateCourseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
