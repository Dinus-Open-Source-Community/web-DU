import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from './Header'
import { Button } from '../ui/button'
import { AdminUnderlineTabs } from '@/components/admin/AdminUnderlineTabs'
import CardMentor from './CardMentor'
import { Pagination } from './Pagination'
import { NothingLottieIllustration } from '@/components/playful/NothingLottieIllustration'
import { CreateCourseDialog } from './CreateCourse'
import { CourseCardSkeletonGrid } from './CourseCardSkeleton'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import type { CourseFormOptionsViewModel } from '@/lib/course-form/course-form-options-view-model'
import type { CourseFormValues } from '@/lib/course-form/types'
import type { ICourseItem } from '@/lib/types/course'
import { ROUTES } from '@/lib/routes'
import {
  appCardClassName,
  appToolbarPrimaryButtonClassName,
} from '@/lib/design/app-shell-tokens'
import { cn } from '@/lib/utils'

const filters = ['Semua', 'Aktif', 'Draf'] as const
type CourseFilter = (typeof filters)[number]
const ITEMS_PER_PAGE = 8

const EMPTY_FILTER_COPY: Record<
  CourseFilter,
  { title: string; descriptionAdmin: string; descriptionMentor: string }
> = {
  Semua: {
    title: 'Belum ada kursus',
    descriptionAdmin: 'Buat kursus baru untuk mengisi katalog.',
    descriptionMentor: 'Belum ada kursus di daftar Anda.',
  },
  Aktif: {
    title: 'Tidak ada kursus aktif',
    descriptionAdmin: 'Tidak ada kursus yang sudah dipublikasikan. Cek tab Draf atau buat kursus baru.',
    descriptionMentor: 'Tidak ada kursus yang sudah dipublikasikan.',
  },
  Draf: {
    title: 'Tidak ada kursus draf',
    descriptionAdmin: 'Semua kursus sudah aktif, atau belum ada kursus sama sekali.',
    descriptionMentor: 'Tidak ada kursus yang masih dalam draf.',
  },
}

type CreateCourseActions = {
  submitting: boolean
  onSubmit: (values: CourseFormValues) => Promise<void>
}

type CourseManagementSectionProps = {
  role: 'mentor' | 'admin'
  data: ICourseItem[] | null
  /** Saat true, tampilkan skeleton kartu — jangan empty state. */
  isLoading?: boolean
  formOptions?: CourseFormOptionsViewModel
  createCourse?: CreateCourseActions
  createOpen?: boolean
  onCreateOpenChange?: (open: boolean) => void
}

export default function ManageCourseSection({
  role = 'mentor',
  data,
  isLoading = false,
  formOptions,
  createCourse,
  createOpen: controlledCreateOpen,
  onCreateOpenChange,
}: CourseManagementSectionProps) {
  const isAdmin = role === 'admin'
  const [activeFilter, setActiveFilter] = useState<CourseFilter>('Semua')
  const [currentPage, setCurrentPage] = useState(1)
  const [internalCreateOpen, setInternalCreateOpen] = useState(false)
  const createOpen = controlledCreateOpen ?? internalCreateOpen
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen
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
  const emptyCopy = EMPTY_FILTER_COPY[activeFilter]

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4">
          <PageHeader
            title="Semua kursus"
            subtitle={
              isAdmin
                ? 'Kelola kursus platform: buat, atur, dan hapus kursus.'
                : 'Kelola modul, lesson, dan peserta pada kursus yang Anda bimbing.'
            }
            className="mb-0 space-y-2"
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <AdminUnderlineTabs<CourseFilter>
              variant="pill"
              items={filters.map((f) => ({ value: f, label: f }))}
              value={activeFilter}
              onChange={setActiveFilter}
              ariaLabel="Filter kursus"
            />
            {isAdmin && (
              <Button
                className={appToolbarPrimaryButtonClassName}
                onClick={() => setCreateOpen(true)}
                type="button"
              >
                <Plus className="h-5 w-5" />
                Buat kursus
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <CourseCardSkeletonGrid count={ITEMS_PER_PAGE} />
        ) : filteredCourses.length > 0 ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCourses.map((c) => (
                <CardMentor
                  key={c.uid}
                  data={c}
                  detailHref={ROUTES.dashboardMenu.courseDetail(c.uid)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="flex w-full justify-center pt-2" aria-label="Pagination daftar kursus">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  variant="admin"
                />
              </nav>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col items-center justify-center py-16 text-center',
              appCardClassName,
              'px-6',
            )}
          >
            <NothingLottieIllustration />
            <h3 className="mb-2 text-xl font-bold text-ink-900">{emptyCopy.title}</h3>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-ink-500">
              {isAdmin ? emptyCopy.descriptionAdmin : emptyCopy.descriptionMentor}
            </p>
            {isAdmin && (
              <Button
                className={cn('mt-6', appToolbarPrimaryButtonClassName)}
                type="button"
                onClick={() => setCreateOpen(true)}
              >
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
