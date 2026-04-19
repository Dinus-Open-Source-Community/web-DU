'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchForm } from '@/components/ui/SearchForm'
import { SegmentedFilter } from '@/components/ui/SegmentedFilter'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { getMergedMentorCourses, setMentorCoursePublished } from '@/lib/mentorCourseStorage'
import type { IMentorCourse } from '@/lib/types'
import { CreateCourseDialog } from './CreateCourseDialog'

const filters = ['Semua', 'Aktif', 'Draf'] as const
const ITEMS_PER_PAGE = 6

export default function MentorCoursesSection() {
  const [courses, setCourses] = useState<IMentorCourse[]>([])
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Semua')
  const [search, setSearch] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const refresh = () => setCourses(getMergedMentorCourses())
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

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
            <SearchForm
              value={search}
              onChange={setSearch}
              onSubmit={() => setSearchApplied(search)}
              placeholder="Cari kursus..."
              className="w-full lg:max-w-3xl lg:flex-1"
              submitButtonClassName="h-[46px]"
            />

            <Button className="h-[46px] shrink-0 gap-2 rounded-xl px-5 font-semibold" onClick={() => setCreateOpen(true)} type="button">
              <Plus className="h-5 w-5" />
              Buat kursus
            </Button>
          </div>
        </div>

        <SegmentedFilter items={filters.map((f) => ({ value: f, label: f }))} value={activeFilter} onChange={setActiveFilter} variant="scroll" />

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
