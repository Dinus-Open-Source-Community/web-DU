import { ArrowLeft, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

import GuestLayout from '@/components/layouts/GuestLayouts'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'

export default function Redeem() {
  return (
    <GuestLayout>
      <main className="bg-paper-white flex min-h-dvh w-full items-center justify-center px-4 pt-22 pb-16 sm:px-6">
        <section className="border-ink-900 bg-paper-offwhite shadow-paper w-full max-w-lg rounded-[10px] border-2 p-8 text-center sm:p-10">
          <div className="border-ink-900 bg-note-yellow mx-auto flex size-20 items-center justify-center rounded-[10px] border-2">
            <Ticket className="text-ink-900 size-9" aria-hidden />
          </div>

          <h1 className="text-ink-900 font-display mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Redeem Code
          </h1>
          <p className="text-ink-500 mt-3 text-base leading-relaxed">
            Halaman tukar kode segera hadir.
          </p>

          <div className="mt-8 flex justify-center">
            <Link to={ROUTES.home}>
              <Button variant="outline" className="gap-2 px-7">
                <ArrowLeft className="size-4" aria-hidden />
                Kembali ke beranda
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </GuestLayout>
  )
}
