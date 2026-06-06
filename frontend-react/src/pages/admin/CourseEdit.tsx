import { useParams, useSearchParams } from "react-router-dom";
import type { ICourseDetailItem } from "@/lib/types/course";
import { useAuth } from "@/providers/auth-provider";
import { useCourseEditData } from "@/hooks/use-course";
import { LottieOverlay } from "@/components/shared/Loader";
import { NotFoundContent } from "@/components/shared/Error";
import { CourseEditClient } from "@/components/courses/(authorized)/editCourse";
import { AppNavbarProvider } from "../../components/shared/Sidebar";

const CourseEdit = () => {
  const { courseUid } = useParams();
  const [searchParams] = useSearchParams();

  const moduleId = searchParams.get("moduleId") ?? undefined;

  const { user } = useAuth();
  const { courseDetail, modules, lessonsByModule, isLoading } =
    useCourseEditData(courseUid ?? "");

  const sidebarUser = user ?? { name: "Admin", email: "admin@doscom.id" };

  if (isLoading) {
    return (
      <AppNavbarProvider role="admin" user={sidebarUser}>
        <LottieOverlay visible={isLoading} />
      </AppNavbarProvider>
    );
  }

  if (!courseUid || !courseDetail.data) {
    return (
      <AppNavbarProvider role="admin" user={sidebarUser}>
        <NotFoundContent />
      </AppNavbarProvider>
    );
  }

  return (
    <AppNavbarProvider
      role="admin"
      user={sidebarUser}
      contentClassName="flex w-full flex-1 flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8"
    >
      <CourseEditClient
        courseData={courseDetail.data as ICourseDetailItem}
        modules={modules}
        lessonsByModule={lessonsByModule}
        initialModuleId={moduleId}
        role="admin"
      />
    </AppNavbarProvider>
  );
};

export default CourseEdit;
