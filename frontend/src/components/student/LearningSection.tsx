import { useState } from "react";
import { SearchForm } from "../shared/SearchForm";
import { PageHeader } from "../shared/Header";
import { UnderlineTabList } from "../shared/UnderlineTabList";
import { Pagination } from "../shared/Pagination";
import type { IUserData } from "@/lib/types/user";
import JoinedCourseCard from "../shared/JoinedCourseCard";
import { PlayfulEmptyIllustration, type PlayfulEmptyVariant } from "@/components/playful/PublicLottieIllustration";
import { appCardClassName } from "@/lib/design/app-shell-tokens";
import { studentDashboardLayout } from "@/lib/layout/student-dashboard-layout";
import { gridCardsClassName } from "@/lib/layout/page-layout";
import { cn } from "@/lib/utils";
import {
  isLearningProgressComplete,
  isLearningProgressInProgress,
  isLearningProgressNotStarted,
} from "@/lib/learning/progress";

const filters = ["Semua", "Sedang Berjalan", "Baru", "Selesai"] as const;
type CourseFilterType = (typeof filters)[number];
const ITEMS_PER_PAGE = 8;

function getCourseCategoryEmptyTitle(filter: CourseFilterType): string {
  switch (filter) {
    case "Sedang Berjalan":
      return "Tidak ada kursus yang sedang berjalan.";
    case "Baru":
      return "Tidak ada kursus baru.";
    case "Selesai":
      return "Belum ada kursus yang selesai.";
    case "Semua":
    default:
      return "Belum ada kursus yang bisa ditampilkan.";
  }
}

function getCourseNotFoundText(filter: CourseFilterType): string {
  switch (filter) {
    case "Sedang Berjalan":
      return "Tidak ada kursus sedang berjalan yang cocok.";
    case "Baru":
      return "Tidak ada kursus baru yang cocok.";
    case "Selesai":
      return "Tidak ada kursus selesai yang cocok.";
    case "Semua":
    default:
      return "Kursus yang Anda cari tidak ditemukan.";
  }
}

function getCourseCategoryVariant(
  filter: CourseFilterType,
  hasSearchMismatch: boolean,
): PlayfulEmptyVariant {
  if (hasSearchMismatch) {
    return "nothing";
  }
  switch (filter) {
    case "Sedang Berjalan":
      return "pending_review";
    case "Baru":
      return "todo";
    case "Selesai":
      return "done";
    case "Semua":
    default:
      return "nothing";
  }
}

function getCourseEmptyDescription(
  filter: CourseFilterType,
  scopedCount: number,
  categoryMatchCount: number,
  hasSearchMismatch: boolean,
): string | undefined {
  if (hasSearchMismatch) {
    return "Coba periksa kembali kata kunci pencarian Anda.";
  }
  if (filter === "Semua" && scopedCount === 0) {
    return "Kursus yang Anda ikuti akan muncul di sini setelah Anda bergabung ke kursus.";
  }
  if (filter === "Sedang Berjalan" && categoryMatchCount === 0) {
    return "Kursus yang sedang Anda pelajari akan tampil di sini. Mulai belajar dari kursus yang tersedia!";
  }
  if (filter === "Baru" && categoryMatchCount === 0) {
    return "Semua kursus yang Anda ikuti sudah mulai dipelajari. Lanjutkan progres belajar Anda!";
  }
  if (filter === "Selesai" && categoryMatchCount === 0) {
    return "Selesaikan modul dan tugas untuk menuntaskan kursus pertama Anda!";
  }
  return undefined;
}

function LearningCourseEmptyState({
  scopedCount,
  categoryMatchCount,
  filter,
  hasSearchApplied,
}: {
  scopedCount: number;
  categoryMatchCount: number;
  filter: CourseFilterType;
  hasSearchApplied: boolean;
}) {
  const isSpecificTab = filter !== "Semua";
  const hasSearchMismatch = hasSearchApplied && categoryMatchCount > 0;
  const notFoundText = getCourseNotFoundText(filter);

  const title = isSpecificTab
    ? categoryMatchCount === 0
      ? getCourseCategoryEmptyTitle(filter)
      : notFoundText
    : scopedCount === 0
      ? "Belum ada kursus yang bisa ditampilkan."
      : categoryMatchCount === 0
        ? getCourseCategoryEmptyTitle(filter)
        : notFoundText;

  const description = getCourseEmptyDescription(
    filter,
    scopedCount,
    categoryMatchCount,
    hasSearchMismatch,
  );

  const variant = getCourseCategoryVariant(filter, hasSearchMismatch);

  return (
    <div
      className={cn(
        appCardClassName,
        "flex flex-col items-center px-6 py-16 text-center",
      )}
    >
      <PlayfulEmptyIllustration
        variant={variant}
        className="mb-1 max-w-[12rem]"
      />
      <h3 className="mb-2 text-xl font-bold text-ink-900">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm font-medium leading-relaxed text-ink-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

const LearningSection = ({ Data }: { Data: IUserData }) => {
  const [activeFilter, setActiveFilter] =
    useState<CourseFilterType>("Semua");
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const validEnrolledCourses = Data.joined_courses;

  const categoryFilteredCourses = validEnrolledCourses.filter((course) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Sedang Berjalan")
      return isLearningProgressInProgress(course.progress);
    if (activeFilter === "Baru")
      return isLearningProgressNotStarted(course.progress);
    if (activeFilter === "Selesai")
      return isLearningProgressComplete(course.progress);
    return true;
  });

  const filteredCourses = categoryFilteredCourses.filter((course) => {
    const q = searchApplied.trim().toLowerCase();
    if (!q) return true;
    const inTitle = course.title.toLowerCase().includes(q);
    const inDesc = course.subtitle?.toLowerCase().includes(q) ?? false;
    return inTitle || inDesc;
  });

  const scopedCount = validEnrolledCourses.length;
  const categoryMatchCount = categoryFilteredCourses.length;
  const hasSearchApplied = Boolean(searchApplied.trim());

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-5">
        <PageHeader
          className={studentDashboardLayout.pageHeader}
          title="Kursus Saya"
          subtitle="Lanjutkan pembelajaran Anda untuk mencapai tujuan karir dan raih sertifikat."
        />

        <SearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => {
            setSearchApplied(searchInput);
            setCurrentPage(1);
          }}
          placeholder="Cari kursus..."
        />
      </div>

      <UnderlineTabList
        variant="pill"
        value={activeFilter}
        options={filters.map((f) => ({ value: f, label: f }))}
        onChange={(value) => {
          setActiveFilter(value);
          setCurrentPage(1);
        }}
        ariaLabel="Filter kursus"
      />

      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-8">
          <div className={gridCardsClassName}>
            {paginatedCourses.map((course) => {
              const isInProgress = isLearningProgressInProgress(
                course.progress,
              );

              return (
                <JoinedCourseCard
                  key={course.uid}
                  data={course}
                  variant={isInProgress ? "resume" : "non-resume"}
                  size="sm"
                />
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <LearningCourseEmptyState
          scopedCount={scopedCount}
          categoryMatchCount={categoryMatchCount}
          filter={activeFilter}
          hasSearchApplied={hasSearchApplied}
        />
      )}
    </section>
  );
};

export default LearningSection;
