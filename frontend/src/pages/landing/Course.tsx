import CourseSection1 from '../../components/courses/course'
import GuestLayout from '../../components/layouts/GuestLayouts'

export default function CoursePage() {
  return (
    <GuestLayout navbarAuthVariant="home" marketingSurface>
      <main className="w-full">
        <CourseSection1 />
      </main>
    </GuestLayout>
  )
}

