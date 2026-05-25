import type { BadgeVariant } from '@/lib/types/course'
import { useEffect, useState } from 'react'
import { SearchForm } from '../shared/SearchForm'
import { FilterCheckboxPanel } from '../shared/FilterCheckbox'
import CardCourse from '../shared/CardCourse'
import { Pagination } from '../shared/Pagination'
import { EmptyCourseIcon } from '../shared/icon'
import { FormatRupiah } from '@/lib/func/func'
import type { CategoryItem, ICourseItem } from '@/lib/types/api'

const ITEMS_PER_PAGE = 6

type CatalogCourse = {
  uid: string
  title: string
  description: string
  category?: string
  image: string
  variantBadge?: BadgeVariant
  author?: { name: string; avatar: string }
  rating?: number
  totalReviews?: number
  price: number
}

export default function Section({ data }: { data: CategoryItem[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  const catalog: CatalogCourse[] = data.flatMap(
    (c) =>
      (c.courses as ICourseItem[] | undefined)?.map((course) => {
        const item = course
        return {
          uid: (item.uid as string) ?? '',
          title: (item.title as string) ?? '',
          description: (item.description as string) ?? '',
          category: (item.category_uid as string) ?? undefined,
          image: (item.cover_url as string) ?? (item.thumbnail_url as string) ?? '',
          variantBadge: ((item.is_premium as boolean) ? 'premium' : 'free') as BadgeVariant,
          author: {
            name: ((item.mentors as { name: string }[])?.[0]?.name as string) ?? 'Mentor',
            avatar: ((item.mentors as { avatar_url: string }[])?.[0]?.avatar_url as string) ?? '',
          },
          // rating: (item.rating as number) ?? 0,
          // totalReviews: (item.total_reviews as number) ?? 0,
          price: (item.price as number) ?? 0,
        }
      }) ?? [],
  )

  const categories = [...new Set(data.map((c) => c.name).filter(Boolean))] as string[]

  const filteredCourses = catalog.filter((course) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
    const categoryHit = selectedCategories.length === 0 || (course.category && selectedCategories.includes(course.category))
    return matchesSearch && categoryHit
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  return (
    <section className="flex w-full flex-col gap-10">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Katalog Kursus</h1>
          <p className="text-sm font-medium text-slate-500">Eksplorasi materi terbaik untuk tingkatkan keahlian Anda secara profesional.</p>
        </div>
        <SearchForm value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchQuery(searchInput)} placeholder="Cari kursus..." />
      </div>

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <FilterCheckboxPanel title="Kategori" options={categories} selected={selectedCategories} onToggle={toggleCategory} />

        <div className="min-w-0 flex-1">
          {filteredCourses.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCourses.map((course, idx) => (
                  <CardCourse
                    key={`${course.uid}-${idx}`}
                    data={{
                      title: course.title,
                      description: course.description,
                      image: course.image,
                      variantBadge: course.variantBadge,
                      author: course.author,
                      rating: course.rating,
                      totalReviews: course.totalReviews,
                      price: course.price === 0 ? 'Gratis' : String(FormatRupiah(course.price)),
                      detailHref: `/course/${course.uid}`,
                    }}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50 py-24 text-center">
              <EmptyCourseIcon className="mb-6 h-40 w-40" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">Ups, hasil tidak ditemukan</h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">Kami tidak menemukan kursus yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
