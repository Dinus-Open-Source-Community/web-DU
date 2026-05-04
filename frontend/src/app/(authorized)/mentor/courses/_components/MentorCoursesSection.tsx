'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchForm } from '@/components/ui/SearchForm'
import { SegmentedFilter } from '@/components/ui/SegmentedFilter'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { useCoursesQuery } from '@/hooks/api/use-course-queries'
import { CreateCourseDialog } from './CreateCourseDialog'

const filters = ['Semua', 'Aktif', 'Draf'] as const
const ITEMS_PER_PAGE = 6

type CourseManagementSectionProps = {
  role?: 'mentor' | 'admin'
}

type CourseListItem = {
  uid: string
  title: string
  subtitle?: string
  description?: string
  cover_url?: string
  thumbnail_url?: string
  status?: string
  is_published?: boolean
  created_at?: string
  updated_at?: string
}

function toPublished(status?: string, isPublished?: boolean): boolean {
  if (typeof isPublished === 'boolean') return isPublished
  return typeof status === 'string' ? status.toUpperCase() === 'ACTIVE' : false
}

export default function MentorCoursesSection({ role = 'mentor' }: CourseManagementSectionProps) {
  const isAdmin = role === 'admin'
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Semua')
  const [search, setSearch] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useCoursesQuery()
  const courses = useMemo(() => (data?.courses ?? []) as CourseListItem[], [data])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchApplied])

  const filteredCourses = useMemo(() => {
    const q = searchApplied.trim().toLowerCase()
    return courses.filter((c) => {
      const published = toPublished(c.status, c.is_published)
      if (activeFilter === 'Aktif' && !published) return false
      if (activeFilter === 'Draf' && published) return false
      if (!q) return true
      return c.title.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false) || (c.subtitle?.toLowerCase().includes(q) ?? false)
    })
  }, [courses, activeFilter, searchApplied])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-5">
          <PageHeader title="Courses" subtitle={isAdmin ? 'Kelola kursus platform: buat, atur, dan hapus kursus.' : 'Kelola konten modul, lesson, dan peserta kursus.'} />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SearchForm
              value={search}
              onChange={setSearch}
              onSubmit={() => setSearchApplied(search)}
              placeholder="Cari kursus..."
              className="w-full lg:max-w-3xl lg:flex-1"
              submitButtonClassName="h-[46px]"
            />

            {isAdmin && (
              <Button className="h-11.5 shrink-0 gap-2 rounded-xl px-5 font-semibold" onClick={() => setCreateOpen(true)} type="button">
                <Plus className="h-5 w-5" />
                Buat kursus
              </Button>
            )}
          </div>
        </div>

        <SegmentedFilter items={filters.map((f) => ({ value: f, label: f }))} value={activeFilter} onChange={setActiveFilter} variant="scroll" />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedCourses.map((c) => (
                <Card
                  key={c.uid}
                  variant="mentorCourse"
                  title={c.title}
                  description={c.description ?? c.subtitle}
                  image={c.cover_url ?? c.thumbnail_url}
                  mentorHeader={c.subtitle}
                  mentorPublished={toPublished(c.status, c.is_published)}
                  mentorModuleCount={0}
                  mentorStudentCount={0}
                  rating={0}
                  totalReviews={0}
                  detailHref={`${isAdmin ? '/admin' : '/mentor'}/courses/${c.uid}`}
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
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              {isAdmin ? 'Ubah filter atau kata kunci pencarian, atau buat kursus baru.' : 'Ubah filter atau kata kunci pencarian untuk melihat kursus yang tersedia.'}
            </p>
            {isAdmin && (
              <Button className="mt-6 rounded-xl" type="button" onClick={() => setCreateOpen(true)}>
                Buat kursus
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateCourseDialog open={createOpen} onOpenChange={setCreateOpen} roleBasePath={isAdmin ? '/admin' : '/mentor'} />
    </>
  )
}
