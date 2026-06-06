import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CourseModulePreview } from "@/components/courses/(authorized)/viewModuleAndLessons";
import { LottieOverlay } from "@/components/shared/Loader";
import { NotFoundContent } from "../../components/shared/Error";
import { useCourseEditData } from "@/hooks/use-course";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/lib/types/user";
import type { ICourseDetailItem, IModulesDetail } from "@/lib/types/course";

export default function CourseViewPage() {
  const { courseUid } = useParams();
  const { user } = useAuth();

  const { courseDetail, modules, lessonsByModule, isLoading } = useCourseEditData(
    courseUid ?? "",
  );

  const storedModules = useMemo<IModulesDetail[]>(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessonsByModule[module.uid] ?? [],
      })),
    [modules, lessonsByModule],
  );

  if (isLoading) {
    return <LottieOverlay visible={isLoading} />;
  }

  if (!courseUid || !courseDetail.data) {
    return <NotFoundContent />;
  }

  const courseWithModules: ICourseDetailItem = {
    ...(courseDetail.data as ICourseDetailItem),
    modules: storedModules,
  };

  return (
    <CourseModulePreview
      courseUid={courseUid}
      variant={user?.role as UserRole}
      mentorCourse={courseWithModules}
      storedModules={storedModules}
    />
  );
}
