import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  Rocket,
  Search as SearchIcon,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StickerTape, StickerStar, StickerSparkle } from '@/components/playful/Stickers'
import HandUnderline from '@/components/playful/HandUnderline'
import { isCoursePublished } from '@/lib/course-detail/publish-state'
import { apiLevelToUi, uiLevelToApi } from '@/lib/course-form/level'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { CourseUiLevel } from '@/lib/types'
import type { ICategoryItem, ICourseItem } from '@/lib/types/course'
import { useCourses } from '@/hooks/use-course'
import { filterAvailableCourses } from '@/lib/course-catalog/available-courses'
import { useAuth } from '@/providers/auth-provider'
import { useSimulateEmpty } from '@/lib/simulation'

const CARD_ACCENTS = [
  { bg: 'bg-note-mint' },
  { bg: 'bg-note-yellow' },
  { bg: 'bg-note-peach' },
  { bg: 'bg-note-sky' },
  { bg: 'bg-note-lavender' },
  { bg: 'bg-note-pink' },
] as const

const FALLBACK_ICONS: LucideIcon[] = [BookOpen, Compass, Layers, Rocket, Sparkles]

const TAPE_POSITIONS = [
  'absolute -top-2.5 left-6 -rotate-2',
  'absolute -top-2.5 right-6 rotate-2',
  'absolute -top-2.5 left-8 rotate-1',
  'absolute -top-2.5 right-8 -rotate-1',
]

export default function CourseSection1({
  Data: initialData,
  isLoading: initialIsLoading = false,
}: {
  Data?: ICourseItem[]
  Categories?: ICategoryItem[]
  isLoading?: boolean
} = {}) {
  const { profile } = useAuth()
  const [simulateEmpty] = useSimulateEmpty()
  const [selectedLevels, setSelectedLevels] = useState<CourseUiLevel[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(6)

  // Debounce input pencarian 300ms agar query backend efisien
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset pagination ke halaman 1 saat query pencarian, level, atau itemsPerPage berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedLevels, itemsPerPage])

  const apiLevel = selectedLevels.length > 0 ? uiLevelToApi(selectedLevels[0]) : undefined

  // Server-side courses query saat initialData tidak diberikan
  const { data: serverCoursesData, isLoading: isQueryLoading } = useCourses(
    {
      status: 'ACTIVE',
      page: currentPage,
      per_page: itemsPerPage,
      title: debouncedSearchQuery.trim() || undefined,
      level: apiLevel,
    },
    { enabled: !initialData },
  )

  const isLoading = initialIsLoading || (Boolean(!initialData) && isQueryLoading)

  const { paginatedCourses, totalCourses, totalPages, safeCurrentPage, startIndex, endIndex } = useMemo(() => {
    if (simulateEmpty) {
      return {
        paginatedCourses: [],
        totalCourses: 0,
        totalPages: 1,
        safeCurrentPage: 1,
        startIndex: 0,
        endIndex: 0,
      }
    }

    if (initialData) {
      const keyword = debouncedSearchQuery.trim().toLowerCase()
      const filtered = initialData.filter((course) => {
        const isPublished = isCoursePublished(course)
        const matchSearch =
          !keyword ||
          [
            course.title,
            course.subtitle,
            course.description,
            course.created_by?.name,
            ...(course.mentors?.map((mentor) => mentor.name) || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(keyword)

        const courseLevelUi = apiLevelToUi(course.level)
        const matchLevel =
          selectedLevels.length === 0 || selectedLevels.includes(courseLevelUi)

        return isPublished && matchSearch && matchLevel
      })

      const total = filtered.length
      const pages = Math.max(1, Math.ceil(total / itemsPerPage))
      const safePage = Math.min(currentPage, pages)
      const start = (safePage - 1) * itemsPerPage
      const end = start + itemsPerPage

      return {
        paginatedCourses: filtered.slice(start, end),
        totalCourses: total,
        totalPages: pages,
        safeCurrentPage: safePage,
        startIndex: start,
        endIndex: end,
      }
    }

    const rawCourses = serverCoursesData?.courses ?? []
    const available = filterAvailableCourses(rawCourses, profile?.joined_courses)
    const meta = serverCoursesData?.meta
    const total = meta?.total ?? available.length
    const pages = Math.max(1, meta?.total_pages ?? Math.ceil(total / itemsPerPage))
    const safePage = Math.min(currentPage, pages)
    const start = (safePage - 1) * itemsPerPage
    const end = start + available.length

    return {
      paginatedCourses: available,
      totalCourses: total,
      totalPages: pages,
      safeCurrentPage: safePage,
      startIndex: start,
      endIndex: end,
    }
  }, [
    simulateEmpty,
    initialData,
    debouncedSearchQuery,
    selectedLevels,
    itemsPerPage,
    currentPage,
    serverCoursesData,
    profile?.joined_courses,
  ])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setSelectedLevels([])
    setCurrentPage(1)
  }

  return (
    <section className="relative min-h-dvh overflow-hidden bg-paper-offwhite">
      {/* Garis batas atas kertas */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-ink-900/80" />

      {/* Pola titik dot grid khas materi pembelajaran */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(#050914 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Dekorasi stiker playful */}
      <StickerStar className="pointer-events-none absolute right-[5%] top-24 hidden size-10 rotate-12 opacity-80 md:block" />
      <StickerSparkle className="pointer-events-none absolute left-[4%] top-36 hidden size-8 -rotate-12 opacity-70 md:block" />

      <div className="relative z-1 container mx-auto px-4 pt-20 pb-16 sm:px-6 md:pt-24 md:pb-24 lg:px-10">
        {/* Header Hero Section */}
        <div id="courses-top" className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-sm border-2 border-ink-900 bg-note-yellow px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-900 shadow-button -rotate-1">
            Katalog Kursus
          </span>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.15] [text-wrap:balance]">
            Jelajahi Kursus{' '}
            <span className="relative inline-block text-brand-blue">
              Open Source
              <HandUnderline draw className="absolute -bottom-2.5 left-0 w-full" />
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base md:text-lg">
            Pelajari teknologi modern dan pemrograman langsung dari kurikulum berbasis proyek nyata.
            Dipandu oleh mentor praktisi komunitas Doscom.
          </p>

          {/* Unified Tactile Search Bar + Level Filter */}
          <div className="relative mx-auto mt-8 flex max-w-2xl sm:max-w-3xl flex-col sm:flex-row items-stretch rounded-2xl border-2 border-ink-900 bg-paper-white shadow-button transition-all">
            <div className="relative flex flex-1 items-center">
              <SearchIcon className="pointer-events-none absolute left-4 size-5 text-ink-700" />
              <input
                type="search"
                placeholder="Cari judul kursus, topik, atau mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full bg-transparent pl-12 pr-3 text-sm font-bold text-ink-900 placeholder:font-medium placeholder:text-ink-400 outline-none focus:outline-none focus:ring-0"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-3 grid size-6 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-900/10 hover:text-ink-900"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="h-[2px] w-full bg-ink-900/15 sm:hidden" />
            <div className="hidden h-7 w-[2px] self-center bg-ink-900/15 sm:block" />

            {/* Dropdown Container dengan Jarak/Padding */}
            <div className="flex items-center sm:shrink-0 sm:pl-3 sm:pr-2 mt-[3px] sm:mt-0">
              <Select
                value={selectedLevels.length === 1 ? selectedLevels[0] : 'all'}
                onValueChange={(val) => {
                  if (val === 'all') {
                    setSelectedLevels([])
                  } else {
                    setSelectedLevels([val as CourseUiLevel])
                  }
                }}
              >
                <SelectTrigger
                  className="h-10 my-1 w-full sm:w-auto sm:min-w-[170px] border-0 bg-transparent px-3 font-bold text-ink-900 shadow-none hover:bg-paper-panel hover:text-ink-900 rounded-xl focus-visible:ring-0 focus:ring-0 cursor-pointer [&_svg]:text-ink-700 hover:[&_svg]:text-ink-900"
                  aria-label="Filter Level Kursus"
                >
                  <span className="mr-1.5 text-xs font-mono uppercase tracking-wider text-ink-500">
                    Level:
                  </span>
                  <SelectValue placeholder="Semua Level" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={6}
                  className="mt-[3px] border-2 border-ink-900 bg-paper-white shadow-paper rounded-xl z-50 min-w-[170px] p-1.5"
                >
                  <SelectGroup>
                    <SelectItem
                      value="all"
                      className="cursor-pointer font-bold text-ink-900 transition-colors focus:bg-paper-panel focus:text-ink-900 not-data-[variant=destructive]:focus:**:text-ink-900 not-data-[variant=destructive]:focus:text-ink-900 data-[highlighted]:bg-paper-panel data-[highlighted]:text-ink-900 data-[highlighted]:**:text-ink-900"
                    >
                      Semua Level
                    </SelectItem>
                    <SelectItem
                      value="Pemula"
                      className="cursor-pointer font-bold text-ink-900 transition-colors focus:bg-paper-panel focus:text-ink-900 not-data-[variant=destructive]:focus:**:text-ink-900 not-data-[variant=destructive]:focus:text-ink-900 data-[highlighted]:bg-paper-panel data-[highlighted]:text-ink-900 data-[highlighted]:**:text-ink-900"
                    >
                      Pemula
                    </SelectItem>
                    <SelectItem
                      value="Menengah"
                      className="cursor-pointer font-bold text-ink-900 transition-colors focus:bg-paper-panel focus:text-ink-900 not-data-[variant=destructive]:focus:**:text-ink-900 not-data-[variant=destructive]:focus:text-ink-900 data-[highlighted]:bg-paper-panel data-[highlighted]:text-ink-900 data-[highlighted]:**:text-ink-900"
                    >
                      Menengah
                    </SelectItem>
                    <SelectItem
                      value="Lanjutan"
                      className="cursor-pointer font-bold text-ink-900 transition-colors focus:bg-paper-panel focus:text-ink-900 not-data-[variant=destructive]:focus:**:text-ink-900 not-data-[variant=destructive]:focus:text-ink-900 data-[highlighted]:bg-paper-panel data-[highlighted]:text-ink-900 data-[highlighted]:**:text-ink-900"
                    >
                      Lanjutan
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content Layout: Full-Width Course Cards Grid */}
        <div id="courses-catalog" className="relative mt-10 min-h-[420px] w-full lg:mt-14 scroll-mt-24">
          {/* Grid Header Info & Top Pagination Bar */}
          <div className="mb-6 flex flex-col gap-4 border-b-2 border-dashed border-ink-900/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
                Kursus Tersedia
              </h2>
              {totalCourses > 0 ? (
                <p className="mt-1 font-mono text-xs font-bold text-ink-600">
                  Menampilkan{' '}
                  <span className="font-extrabold text-ink-900">
                    {totalCourses === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalCourses)}
                  </span>{' '}
                  dari{' '}
                  <span className="font-extrabold text-ink-900">{totalCourses}</span> kursus
                </p>
              ) : (
                <p className="mt-1 font-mono text-xs font-bold text-ink-500">
                  0 kursus ditemukan
                </p>
              )}
            </div>

            {/* Top Pagination Controls */}
            {totalCourses > 0 && (
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                {/* Per hal selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="hidden font-mono font-bold text-ink-500 md:inline">Per hal:</span>
                  {[6, 9, 12].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(size)
                        setCurrentPage(1)
                      }}
                      className={cn(
                        'h-8 min-w-8 rounded-lg border-2 border-ink-900 px-2 font-mono text-xs font-bold transition-all active:translate-x-[1px] active:translate-y-[1px]',
                        itemsPerPage === size
                          ? 'bg-note-yellow text-ink-900'
                          : 'bg-paper-white text-ink-600 hover:bg-paper-panel hover:text-ink-900',
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <span className="hidden h-6 w-[2px] bg-ink-900/15 sm:block" />

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage <= 1 || isLoading}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border-2 border-ink-900 bg-paper-white px-2.5 font-mono text-xs font-bold text-ink-900 transition-all hover:bg-paper-panel active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden lg:inline">Sebelumnya</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNumber = i + 1
                      const isActive = safeCurrentPage === pageNumber
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={isLoading}
                          aria-label={`Halaman ${pageNumber}`}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'grid size-9 place-items-center rounded-xl border-2 border-ink-900 font-mono text-xs font-bold transition-all active:translate-x-[1px] active:translate-y-[1px]',
                            isActive
                              ? 'bg-note-yellow text-ink-900'
                              : 'bg-paper-white text-ink-700 hover:bg-paper-panel hover:text-ink-900',
                          )}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage >= totalPages || isLoading}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border-2 border-ink-900 bg-paper-white px-2.5 font-mono text-xs font-bold text-ink-900 transition-all hover:bg-paper-panel active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman berikutnya"
                  >
                    <span className="hidden lg:inline">Selanjutnya</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

            {/* Loading Skeletons */}
            {isLoading && paginatedCourses.length === 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900/20 bg-paper-white p-4 shadow-paper animate-pulse"
                  >
                    <div className="aspect-[16/10] w-full rounded-xl border border-ink-900/15 bg-paper-panel" />
                    <div className="mt-3.5 h-3.5 w-1/3 rounded bg-ink-900/10" />
                    <div className="mt-2.5 h-5 w-4/5 rounded bg-ink-900/10" />
                    <div className="mt-2 space-y-1.5">
                      <div className="h-3.5 w-full rounded bg-ink-900/10" />
                      <div className="h-3.5 w-2/3 rounded bg-ink-900/10" />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/10 pt-3">
                      <div className="h-4 w-24 rounded bg-ink-900/10" />
                      <div className="size-8 rounded-lg border border-ink-900/10 bg-paper-panel" />
                    </div>
                  </div>
                ))}
              </div>
            ) : totalCourses === 0 ? (
              /* Empty State */
              <div className="mx-auto my-12 max-w-md py-10 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-note-yellow text-ink-900">
                  <BookOpen className="size-6 text-ink-900" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Tidak Ada Kursus
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Tidak ditemukan kursus yang cocok dengan kata kunci atau filter saat ini.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border-2 border-ink-900 bg-brand-blue px-5 text-xs font-extrabold uppercase tracking-wider text-ink-900 shadow-button transition-all hover:bg-brand-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              /* Course Cards Grid */
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedCourses.map((course, i) => {
                  const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
                  const FallbackIcon = FALLBACK_ICONS[i % FALLBACK_ICONS.length]
                  const tapeClass = TAPE_POSITIONS[i % TAPE_POSITIONS.length]
                  const levelLabel = apiLevelToUi(course.level)
                  const detailHref = ROUTES.courseDetail(course.uid)
                  const ratingValue = course.rating !== undefined ? Number(course.rating) : null
                  const hasReviews = Boolean(ratingValue && ratingValue > 0 && course.total_reviews)
                  const primaryMentor =
                    course.mentors && course.mentors.length > 0 ? course.mentors[0] : null

                  return (
                    <Link
                      key={course.uid}
                      to={detailHref}
                      className="group relative flex h-full flex-col justify-between rounded-[20px] border-2 border-ink-900 bg-paper-white p-4 shadow-paper transition-[translate] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/50 focus-visible:ring-inset"
                    >
                      <StickerTape className={tapeClass} />

                      <div>
                        {/* Visual Cover Frame */}
                        <div
                          className={cn(
                            'relative aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-ink-900 shadow-2xs',
                            accent.bg,
                          )}
                        >
                          <div className="absolute inset-0 flex items-center justify-center p-3 select-none opacity-30">
                            <FallbackIcon className="size-8 text-ink-900" />
                          </div>

                          {course.cover_url || course.thumbnail_url ? (
                            <img
                              src={course.cover_url || course.thumbnail_url}
                              alt={course.title}
                              loading="lazy"
                              className="relative z-1 h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : null}
                        </div>

                        {/* Metadata Bar (Level & Rating) */}
                        <div className="mt-3.5 flex items-center justify-between border-b border-ink-900/10 pb-2 text-xs font-bold">
                          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-ink-600">
                            {levelLabel}
                          </span>
                          {hasReviews ? (
                            <div className="flex items-center gap-1 text-ink-700">
                              <Star className="fill-note-yellow size-3 text-ink-900" />
                              <span className="font-mono text-[11px] font-bold">
                                {ratingValue?.toFixed(1)}
                              </span>
                              <span className="text-[10px] font-normal text-ink-400">
                                ({course.total_reviews})
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* Course Title — Warna Ink Tetap, Tanpa Hover Biru */}
                        <h3 className="mt-2.5 line-clamp-2 font-display text-base font-bold leading-snug text-ink-900">
                          {course.title}
                        </h3>

                        {/* Course Description */}
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-600">
                          {course.description || course.subtitle}
                        </p>
                      </div>

                      {/* Footer: Mentor & Action Arrow */}
                      <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/15 pt-3">
                        {primaryMentor ? (
                          <div className="flex items-center gap-2 min-w-0">
                            {primaryMentor.avatar_url ? (
                              <img
                                src={primaryMentor.avatar_url}
                                alt={primaryMentor.name}
                                className="size-5 shrink-0 rounded-full border border-ink-900 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="grid size-5 shrink-0 place-items-center rounded-full border border-ink-900 bg-note-yellow font-mono text-[9px] font-bold text-ink-900">
                                {primaryMentor.name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate text-xs font-bold text-ink-800">
                              {primaryMentor.name}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-500">
                            Doscom
                          </span>
                        )}

                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink-900 bg-paper-white text-ink-900 shadow-2xs transition-all duration-200 group-hover:bg-note-yellow group-hover:translate-x-0.5">
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
  )
}
