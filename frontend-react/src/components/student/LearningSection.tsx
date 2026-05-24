import { useState } from 'react'
import { SearchForm } from '../shared/SearchForm'
import { SegmentedFilter } from '../shared/SegemntedFilter'
import { Pagination } from '../shared/Pagination'
import { EmptyCourseIcon } from '../shared/icon'
import type { IUserData } from '@/lib/types/user'
import JoinedCourseCard from '../shared/JoinedCourseCard'

const filters = ['Semua', 'Sedang Berjalan', 'Baru', 'Selesai'] as const
const ITEMS_PER_PAGE = 6

const LearningSection = ({ Data }: { Data: IUserData }) => {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Semua')
  const [searchInput, setSearchInput] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCourses = Data.joined_courses.filter((course) => {
    if (course.enrollment_status === 'pending' || course.enrollment_status === 'cancelled') return false

    const q = searchApplied.trim().toLowerCase()
    if (q) {
      const inTitle = course.title.toLowerCase().includes(q)
      const inDesc = course.subtitle?.toLowerCase().includes(q) ?? false
      if (!inTitle && !inDesc) return false
    }

    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Sedang Berjalan') return course.progress > 0 && course.progress < 100
    if (activeFilter === 'Baru') return course.progress === 0
    if (activeFilter === 'Selesai') return course.progress === 100
    return true
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Kursus Saya</h1>
          <p className="text-sm font-medium text-slate-500">Lanjutkan pembelajaran Anda untuk mencapai tujuan karir dan raih sertifikat.</p>
        </div>

        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setSearchApplied(searchInput)
            setCurrentPage(1)
          }}
          placeholder="Cari kursus..."
        />
      </div>

      <SegmentedFilter
        items={filters.map((f) => ({ value: f, label: f }))}
        value={activeFilter}
        onChange={(value) => {
          setActiveFilter(value)
          setCurrentPage(1)
        }}
        variant="scroll"
      />

      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course) => {
              const isInProgress = course.progress > 0 && course.progress < 100

              return <JoinedCourseCard key={course.uid} data={course} variant={isInProgress ? 'resume' : 'non-resume'} />
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

export default LearningSection
