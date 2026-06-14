import type { ICategoryItem, ICourseItem } from "@/lib/types/course";
import { useEffect, useState } from "react";
import { SearchForm } from "../shared/SearchForm";
import { FilterCheckboxPanel } from "../shared/FilterCheckbox";
import CardCourse from "../shared/CardCourse";
import { Pagination } from "../shared/Pagination";
import { EmptyCourseIcon } from "../shared/icon";

const ITEMS_PER_PAGE = 6;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, searchQuery]);

  const categories = [
    ...new Set(dataCategories.map((c) => c.name).filter(Boolean)),
  ] as string[];

  const filteredCourses = dataCourses.filter((course) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q);
    const categoryHit =
      selectedCategories.length === 0 ||
      (course.category_uid &&
        selectedCategories.includes(
          dataCategories.find((c) => c.uid === course.category_uid)?.name || "",
        ));
    return matchesSearch && categoryHit;
  });

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <section className="flex w-full flex-col gap-10">
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50 py-24 text-center">
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
