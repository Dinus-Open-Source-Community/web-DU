import { useState } from "react";
import { SearchForm } from "../shared/SearchForm";
import { PageHeader } from "../shared/Header";
import { UnderlineTabList } from "../shared/UnderlineTabList";
import { Pagination } from "../shared/Pagination";
import type { IUserData } from "@/lib/types/user";
import JoinedCourseCard from "../shared/JoinedCourseCard";
import { NothingLottieIllustration } from "@/components/playful/NothingLottieIllustration";
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
const ITEMS_PER_PAGE = 6;

const LearningSection = ({ Data }: { Data: IUserData }) => {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("Semua");
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = Data.joined_courses.filter((course) => {
    if (
      course.enrollment_status === "pending" ||
      course.enrollment_status === "cancelled"
    )
      return false;

    const q = searchApplied.trim().toLowerCase();
    if (q) {
      const inTitle = course.title.toLowerCase().includes(q);
      const inDesc = course.subtitle?.toLowerCase().includes(q) ?? false;
      if (!inTitle && !inDesc) return false;
    }

    if (activeFilter === "Semua") return true;
    if (activeFilter === "Sedang Berjalan")
      return isLearningProgressInProgress(course.progress);
    if (activeFilter === "Baru")
      return isLearningProgressNotStarted(course.progress);
    if (activeFilter === "Selesai")
      return isLearningProgressComplete(course.progress);
    return true;
  });

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
        value={activeFilter}
        options={filters.map((f) => ({ value: f, label: f }))}
        onChange={(value) => {
          setActiveFilter(value);
          setCurrentPage(1);
        }}
        ariaLabel="Tipe kursus"
        className="w-max max-w-full"
      />

      {filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className={cn(gridCardsClassName, "lg:grid-cols-4")}>
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
        <div className={cn(appCardClassName, "flex min-h-[40vh] flex-col items-center justify-center px-6 py-16 text-center")}>
          <NothingLottieIllustration />
          <h3 className="mb-2 text-xl font-bold text-ink-900">
            Kursus tidak ditemukan
          </h3>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-ink-500">
            Coba ubah kata kunci pencarian atau filter status.
          </p>
        </div>
      )}
    </section>
  );
};

export default LearningSection;
