import { SuspenseLoader } from '@/components/feedback/SuspenseLoader'
import Section from './_components/section'

export default function StudentBrowsePage() {
  return (
    <main>
      <SuspenseLoader label="Memuat katalog kursus">
        <Section />
      </SuspenseLoader>
    </main>
  )
}
