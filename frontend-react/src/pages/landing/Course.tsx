import type { ICardData } from '../../lib/types/utils'
import CourseSection1 from '../../components/courses/course'
import GuestLayout from '../../components/layouts/GuestLayouts'

export default function CoursePage() {
  const data: ICardData[] = []
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <GuestLayout>
        <CourseSection1 Data={data} />
      </GuestLayout>
    </main>
  )
}
