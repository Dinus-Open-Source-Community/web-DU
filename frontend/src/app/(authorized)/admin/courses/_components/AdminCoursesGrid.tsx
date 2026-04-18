'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookMarked } from 'lucide-react'
import { EmptyState } from '@/components/admin/EmptyState'
import { SearchForm } from '@/components/ui/SearchForm'
import { FilterCheckboxPanel } from '@/components/ui/FilterCheckboxPanel'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { listCourses } from '@/lib/data/repository'
import { formatRupiah } from '@/lib/func'

const CATEGORIES = [
  'Pengembangan Web',
  'Desain UI/UX',
  'Data Science & AI',
  'Bisnis & Manajemen',
  'Cybersecurity',
]

const ITEMS_PER_PAGE = 6

export function AdminCoursesGrid() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return listCourses().filter((course) => {
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategories.length === 0 ||
        (course.category && selectedCategories.includes(course.category))
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategories])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE))
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <SearchForm
        value={searchInput}
        onChange={(v) => {
          setSearchInput(v)
          if (v === '') setSearchQuery('')
        }}
        onSubmit={() => setSearchQuery(searchInput)}
        placeholder="Cari judul kursus atau deskripsi..."
        submitLabel="Cari"
        className="flex-1 min-w-[240px]"
      />

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <FilterCheckboxPanel
          title="Kategori"
          options={CATEGORIES}
          selected={selectedCategories}
          onToggle={toggleCategory}
        />

        <div className="min-w-0 flex-1">
          {filteredCourses.length === 0 ? (
            <EmptyState
              icon={<BookMarked className="h-5 w-5" />}
              title="Tidak ada kursus ditemukan"
              description="Coba ubah kata kunci atau kategori untuk melihat hasil."
            />
          ) : (
            <div className="flex flex-col gap-8">
              <div
                key={`${selectedCategories.join(',')}-${searchQuery}-${currentPage}`}
                className="grid grid-cols-1 gap-6 duration-500 ease-out animate-in fade-in slide-in-from-bottom-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCourses.map((course, idx) => (
                  <Card
                    key={`${course.uid}-${idx}`}
                    variant="course"
                    title={course.title}
                    description={course.description}
                    image={course.image}
                    variantBadge={course.variantBadge}
                    author={course.author}
                    rating={course.rating}
                    totalReviews={course.totalReviews}
                    price={course.price === 0 ? 'Gratis' : formatRupiah(course.price)}
                    detailHref={`/course/${course.uid}`}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
