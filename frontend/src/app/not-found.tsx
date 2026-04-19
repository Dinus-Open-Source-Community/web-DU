import Link from 'next/link'
import { NotFoundContent } from '@/components/feedback/NotFoundContent'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16">
      <NotFoundContent
        actions={
          <>
            <Button asChild className="rounded-xl shadow-none">
              <Link href="/">Beranda</Link>
            </Button>
          </>
        }
      />
    </div>
  )
}
