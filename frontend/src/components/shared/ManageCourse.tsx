import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from './Header'
import { Button } from '../ui/button'
import { SegmentedFilter } from './SegemntedFilter'
import CardMentor from './CardMentor'
import { Pagination } from './Pagination'
import { EmptyCourseIcon } from './icon'
import { CreateCourseDialog } from './CreateCourse'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import type { CourseFormValues } from '@/lib/course-form/types'
import type { ICourseItem } from '@/lib/types/course'

const filters = ['Semua', 'Aktif', 'Draf'] as const
type CourseFilter = (typeof filters)[number]
const ITEMS_PER_PAGE = 6

type CreateCourseActions = {
  submitting: boolean
  onSubmit: (values: CourseFormValues) => Promise<void>
}

type CourseManagementSectionProps = {
  role: 'mentor' | 'admin'
  data: ICourseItem[] | null
  formOptions?: CourseFormOptionsViewModel
  createCourse?: CreateCourseActions
}

export default function ManageCourseSection({
  role = 'mentor',
  data,
  formOptions,
  createCourse,
}: CourseManagementSectionProps) {
  const isAdmin = role === 'admin'
  const [activeFilter, setActiveFilter] = useState<CourseFilter>('Semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const courses = useMemo(() => data ?? ([] as ICourseItem[]), [data])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const published = isCoursePublished(c)
      if (activeFilter === 'Aktif' && !published) return false
      if (activeFilter === 'Draf' && published) return false
      return true
    })
  }, [courses, activeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-5">
          <PageHeader title="Courses" subtitle={isAdmin ? 'Kelola kursus platform: buat, atur, dan hapus kursus.' : 'Kelola konten modul, lesson, dan peserta kursus.'} />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SegmentedFilter<CourseFilter>
              items={filters.map((f) => ({ value: f, label: f }))}
              value={activeFilter}
              onChange={setActiveFilter}
              variant="scroll"
            />
            {isAdmin && (
              <Button className="h-11.5 shrink-0 gap-2 rounded-xl px-5 font-semibold" onClick={() => setCreateOpen(true)} type="button">
                <Plus className="h-5 w-5" />
                Buat kursus
              </Button>
            )}
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {paginatedCourses.map((c) => (
                <CardMentor
                  key={c.uid}
                  data={c}
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

      {isAdmin && formOptions && createCourse ? (
        <CreateCourseDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          submitting={createCourse.submitting}
          onSubmitCreate={createCourse.onSubmit}
          categories={formOptions.categories}
          courseTypes={formOptions.courseTypes}
          optionsLoading={formOptions.optionsLoading}
        />
      ) : null}
    </>
  )
}
