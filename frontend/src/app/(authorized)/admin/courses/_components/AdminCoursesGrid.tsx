'use client'

import { useMemo, useState } from 'react'
import { Plus, BookMarked } from 'lucide-react'

import { EmptyState } from '@/components/admin/EmptyState'
import { Button } from '@/components/ui/button'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { SearchForm } from '@/components/ui/SearchForm'
import {
  adminCourses,
  type CourseCategory,
  type CourseStatus,
} from '@/lib/data/admin-fixtures'

import { AdminCourseCard } from './AdminCourseCard'

type CategoryFilter = 'all' | CourseCategory
type StatusFilter = 'all' | CourseStatus

const categoryOptions: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'Development', label: 'Development' },
  { value: 'Design', label: 'Design' },
  { value: 'Data & AI', label: 'Data & AI' },
  { value: 'Business', label: 'Business' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
]

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

export function AdminCoursesGrid() {
  const [search, setSearch] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    const q = committedSearch.toLowerCase().trim()
    return adminCourses.filter((c) => {
      const matchCategory = categoryFilter === 'all' || c.category === categoryFilter
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      const matchQuery =
        q === '' ||
        c.title.toLowerCase().includes(q) ||
        c.mentorName.toLowerCase().includes(q)
      return matchCategory && matchStatus && matchQuery
    })
  }, [committedSearch, categoryFilter, statusFilter])

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <SearchForm
            value={search}
            onChange={(v) => {
              setSearch(v)
              if (v === '') setCommittedSearch('')
            }}
            onSubmit={() => setCommittedSearch(search)}
            placeholder="Cari judul kursus atau mentor..."
            submitLabel="Cari"
            className="flex-1 min-w-[240px]"
          />
          <FilterSelect<CategoryFilter>
            id="course-category"
            label="Kategori"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
          />
          <FilterSelect<StatusFilter>
            id="course-status"
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
        <Button className="h-10 shrink-0 rounded-xl px-4">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Buat Kursus
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Menampilkan <strong className="text-slate-700">{filtered.length}</strong> dari{' '}
          {adminCourses.length} kursus
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-5 w-5" />}
          title="Tidak ada kursus ditemukan"
          description="Coba ubah kata kunci, kategori, atau status untuk melihat hasil."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((course) => (
            <AdminCourseCard key={course.uid} course={course} />
          ))}
        </div>
      )}
    </section>
  )
}
