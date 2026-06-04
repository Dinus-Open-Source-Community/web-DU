import { CourseModulePreview } from '@/components/courses/(authorized)/viewModuleAndLessons'
import { useParams } from 'react-router-dom'
import { NotFoundContent } from '../../components/shared/Error'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/lib/types/user'
import { useGetCourseWithModules } from '@/services/course'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import { LottieOverlay } from '@/components/shared/Loader'

export default function CourseViewPage() {
  const { courseUid } = useParams()
  const { user } = useAuth()

  const { courseDetail, modules, isLoading } = useGetCourseWithModules(courseUid ?? '')
  if (isLoading) {
    return <LottieOverlay visible={isLoading} />
  }

  if (!courseUid || !courseDetail) {
    return <NotFoundContent />
  }

  return (
    <CourseModulePreview
      courseUid={courseUid}
      variant={user?.role as UserRole}
      mentorCourse={courseDetail.data as ICourseDetailItem}
      storedModules={(modules.data?.modules ?? []) as IModulesDetail[]}
    />
  )
}
