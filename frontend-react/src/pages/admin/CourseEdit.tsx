import { useParams, useSearchParams } from "react-router-dom";
import type { ICourseDetailItem } from "@/lib/types/course";
import { useSidebarUser } from "@/hooks/use-sidebar-user";
import { useCourseEditModules } from "@/hooks/use-course";
import { LottieOverlay } from "@/components/shared/Loader";
import { NotFoundContent } from "@/components/shared/Error";
import { CourseEditClient } from "@/components/courses/(authorized)/editCourse";
import { AppNavbarProvider } from "../../components/shared/Sidebar";

const CourseEdit = () => {
  const { courseUid } = useParams();
  const [searchParams] = useSearchParams();

  const moduleId = searchParams.get("moduleId") ?? undefined;

  const sidebarUser = useSidebarUser("admin");
  const { courseDetail, modules, isLoading } =
    useCourseEditModules(courseUid ?? "");

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
        initialModuleId={moduleId}
        role="admin"
      />
    </AppNavbarProvider>
  );
};

export default CourseEdit;
