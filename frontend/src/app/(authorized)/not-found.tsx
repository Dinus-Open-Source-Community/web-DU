import Link from 'next/link'
import { NotFoundContent } from '@/components/feedback/NotFoundContent'
import { Button } from '@/components/ui/button'

export default function AuthorizedNotFound() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-6 py-16">
      <NotFoundContent
        description="Halaman yang kamu cari di dashboard tidak ditemukan. Kembali ke halaman sebelumnya atau buka dashboard."
        actions={
          <Button asChild className="rounded-xl shadow-none">
            <Link href="/">Dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
