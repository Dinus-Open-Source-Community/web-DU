'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { EmptyCourseIcon } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/pagination'
import { SearchForm } from '@/components/ui/SearchForm'
import { FilterCheckboxPanel } from '@/components/ui/FilterCheckboxPanel'
import { formatRupiah } from '@/lib/func'
import { useCourses } from '@/hooks/api'
import type { BadgeVariant } from '@/lib/types'

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

export default function Section() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data } = useCourses()

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery])

  const catalog: CatalogCourse[] = (data?.courses ?? []).map((c) => ({
    uid: (c.uid as string) ?? '',
    title: (c.title as string) ?? '',
    description: (c.description as string) ?? '',
    category: (c.category as string) ?? undefined,
    image: (c.cover_url as string) ?? (c.thumbnail_url as string) ?? '',
    variantBadge: (c.is_premium ? 'premium' : 'free') as BadgeVariant,
    author: {
      name: ((c.mentors as { name: string }[])?.[0]?.name as string) ?? 'Mentor',
      avatar: ((c.mentors as { avatar_url: string }[])?.[0]?.avatar_url as string) ?? '',
    },
    rating: (c.rating as number) ?? 0,
    totalReviews: (c.total_reviews as number) ?? 0,
    price: (c.price as number) ?? 0,
  }))

  const categories = [...new Set(catalog.map((c) => c.category).filter(Boolean))] as string[]

  const filteredCourses = catalog.filter((course) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q || course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
    const categoryHit =
      selectedCategories.length === 0 || (course.category && selectedCategories.includes(course.category))
    return matchesSearch && categoryHit
  })

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  return (
    <section className="flex w-full flex-col gap-10 px-8 py-10">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Katalog Kursus</h1>
          <p className="text-sm font-medium text-slate-500">
            Eksplorasi materi terbaik untuk tingkatkan keahlian Anda secara profesional.
          </p>
        </div>
        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchQuery(searchInput)}
          placeholder="Cari kursus..."
        />
      </div>

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <FilterCheckboxPanel
          title="Kategori"
          options={categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
        />

        <div className="min-w-0 flex-1">
          {filteredCourses.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50 py-24 text-center">
              <EmptyCourseIcon className="mb-6 h-40 w-40" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">Ups, hasil tidak ditemukan</h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                Kami tidak menemukan kursus yang sesuai dengan kata kunci atau filter kategori yang Anda pilih.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
