import { gridStatsClassName, gridCardsClassName } from "@/lib/layout/page-layout";
import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils";
import { Calendar, MessageSquare, PlayCircle } from "lucide-react";
import ResumeCard from "@/components/shared/ResumeCard";
import FeedbackCard from "@/components/shared/Feedback";
import type { IUserData } from "@/lib/types/user";
import { isLearningProgressInProgress } from "@/lib/learning/progress";

const feedbackDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DashboardSection = ({ Data }: { Data: IUserData }) => {
  const iconMap: Record<
    string,
    typeof PlayCircle | typeof MessageSquare | typeof Calendar
  > = {
    Aktif: PlayCircle,
    Selesai: MessageSquare,
    Pending: Calendar,
  };
  const resumeCourses = (Data?.joined_courses ?? []).filter((course) =>
    isLearningProgressInProgress(course.progress),
  );
  const recentFeedback = Data.course_reviews.slice(0, 3).map((review) => ({
    status: (review.rating >= 4 ? "Lulus" : "Perlu Revisi") as
      | "Lulus"
      | "Perlu Revisi",
    time: feedbackDateFormatter.format(new Date(review.created_at)),
    title: review.course.title,
    comment: review.comment,
    instructor: {
      name: Data.name,
      avatar: Data.avatar_url || "/pinguin.png",
    },
  }));

  return (
    <section className="w-full flex-col gap-10">
      <div className="mb-10">
        <h1 className="font-headline text-on-surface text-3xl font-extrabold tracking-tight">
          Halo, {Data.name} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">
          Siap untuk melanjutkan perjalanan belajarmu hari ini?
        </p>
      </div>

      <div className={cn("mb-10", gridStatsClassName)}>
        {Data?.enrollment_summary ? (
          Object.entries(Data.enrollment_summary).map(([label, value]) => {
            const Icon = iconMap[label];
            return (
              <StatCard
                key={label}
                variant="compact"
                label={label}
                value={value}
                icon={Icon ? <Icon className="h-5 w-5" /> : undefined}
              />
            );
          })
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
            Belum ada ringkasan data dashboard.
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
          <PlayCircle className="text-primary" size={24} />
          Lanjutkan Belajar
        </h2>
        <div className={gridCardsClassName}>
          {resumeCourses.length > 0 ? (
            resumeCourses.map((course) => (
              <ResumeCard key={course.uid} data={course} />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
              Belum ada kursus untuk dilanjutkan.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline flex items-center gap-2 text-xl font-bold">
              <Calendar className="text-error" size={24} />
              Tenggat Waktu
            </h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
              Tidak ada tenggat waktu saat ini.
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-headline mb-6 flex items-center gap-2 text-xl font-bold">
            <MessageSquare className="text-secondary" size={24} />
            Umpan Balik
          </h2>
          <div className="space-y-4">
            {recentFeedback.length > 0 ? (
              recentFeedback.map((fb, i) => (
                <FeedbackCard
                  key={i}
                  status={fb.status}
                  time={fb.time}
                  title={fb.title}
                  comment={fb.comment}
                  instructor={fb.instructor}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada umpan balik terbaru.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
