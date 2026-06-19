import { gridCardsClassName } from "@/lib/layout/page-layout";
import type { ICategoryItem, ICourseItem } from "@/lib/types/course";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SearchForm } from "../shared/SearchForm";
import { CourseCategoryFilter } from "../shared/CourseCategoryFilter";
import CardCourse from "../shared/CardCourse";
import { Pagination } from "../shared/Pagination";
import { EmptyCourseIcon } from "../shared/icon";

const ITEMS_PER_PAGE = 6;

const TOP_FILTERS = [
  { name: 'All' },
  { name: 'Free' },
  { name: 'Premium' },
  { name: 'Ongoing Event' },
] as const;

export default function Section({
  dataCategories,
  dataCourses,
}: {
  dataCategories: ICategoryItem[];
  dataCourses: ICourseItem[];
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('All');

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, deferredSearchQuery, isActiveFilter]);

  const filteredCourses = useMemo(() => {
    return dataCourses.filter((course) => {
      const q = deferredSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q);
      const categoryHit =
        selectedCategories.length === 0 ||
        (course.category_uid && selectedCategories.includes(course.category_uid));
      const matchesTopFilter =
        isActiveFilter === 'All' ||
        (isActiveFilter === 'Free' && !course.is_premium) ||
        (isActiveFilter === 'Premium' && course.is_premium) ||
        (isActiveFilter === 'Ongoing Event' && Boolean(course.event_uid));
      return matchesSearch && categoryHit && matchesTopFilter;
    });
  }, [dataCourses, deferredSearchQuery, selectedCategories, isActiveFilter]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section className="flex w-full flex-col gap-6 pt-4">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
            Katalog Kursus
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Eksplorasi materi terbaik untuk tingkatkan keahlian Anda secara
            profesional.
          </p>
        </div>
        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchQuery(searchInput)}
          placeholder="Cari kursus..."
        />
      </div>

      <div className="grid grid-cols-2 justify-center gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
        {TOP_FILTERS.map((f) => {
          const isCurrentActive = isActiveFilter === f.name;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => setIsActiveFilter(f.name)}
              className={`border-primary min-h-11 rounded-2xl border px-3 py-2.5 transition-colors sm:px-6 sm:py-3 ${
                isCurrentActive
                  ? 'bg-primary text-white'
                  : 'text-primary bg-transparent'
              }`}
            >
              <span className="justify-center text-center align-middle text-sm font-normal leading-tight sm:text-base">
                {f.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="lg:hidden">
        <CourseCategoryFilter
          categories={dataCategories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      <div className="bg-muted flex flex-col gap-6 rounded-xl p-4 sm:p-6 lg:flex-row lg:items-start lg:p-8">
        <div className="hidden lg:block">
          <CourseCategoryFilter
            categories={dataCategories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <div className="min-w-0 flex-1">
          {filteredCourses.length > 0 ? (
            <div className="flex flex-col gap-6">
              <h5 className="align-middle text-2xl leading-[1.3] font-semibold">
                Available Course
              </h5>
              <div className={gridCardsClassName}>
                {paginatedCourses.map((course) => (
                  <CardCourse
                    key={course.uid}
                    size="lg"
                    data={{
                      title: course.title,
                      description: course.description,
                      thumbnail_url: course.thumbnail_url,
                      is_premium: course.is_premium,
                      mentors: course.mentors,
                      rating: course.rating,
                      total_reviews: course.total_reviews,
                      price: course.price,
                      detailHref: `/course/${course.uid}`,
                      category_uid: course.category_uid,
                      uid: course.uid,
                      course_type_uid: course.course_type_uid,
                      cover_url: course.cover_url,
                      level: course.level,
                      what_you_learn: course.what_you_learn,
                      created_at: course.created_at,
                      updated_at: course.updated_at,
                      created_by: course.created_by,
                      event_uid: course.event_uid,
                      is_published: course.is_published,
                      slot: course.slot,
                      slug: course.slug,
                      status: course.status,
                    }}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-24 text-center">
              <EmptyCourseIcon className="mb-6 h-40 w-40" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Ups, hasil tidak ditemukan
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                Kami tidak menemukan kursus yang sesuai dengan kata kunci atau
                filter kategori yang Anda pilih.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
