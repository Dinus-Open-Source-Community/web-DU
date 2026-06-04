import { CourseModulePreview } from '@/components/courses/(authorized)/viewModuleAndLessons'
import { useParams } from 'react-router-dom'
import { NotFoundContent } from '../../components/shared/Error'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/lib/types/user'
import { useGetCourseDetail, useGetModules } from '@/services/course'
import type { ICourseDetailItem, IModulesDetail } from '@/lib/types/course'
import { LottieOverlay } from '@/components/shared/Loader'

export default function CourseViewPage() {
  const { courseUid } = useParams()
  const { user } = useAuth()

  const { data: courseDetail, isLoading } = useGetCourseDetail(courseUid ?? '')
  const { data: modules, isLoading: isModulesLoading } = useGetModules(courseUid ?? '')

  if (isLoading || isModulesLoading) {
    return <LottieOverlay visible={isLoading || isModulesLoading} />
  }

  if (!courseUid || !courseDetail) {
    return <NotFoundContent />
  }

  return <CourseModulePreview courseUid={courseUid} variant={user?.role as UserRole} mentorCourse={courseDetail as ICourseDetailItem} storedModules={(modules ?? courseDetail.modules ?? []) as IModulesDetail[]} />
}
