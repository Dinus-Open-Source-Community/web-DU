import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { LogoDu } from '@/components/shared/icon'

type AuthLayoutProps = {
  children: ReactNode
  heading?: string
  subheading?: string
}

export default function AuthLayout({
  children,
  heading,
  subheading,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh bg-muted lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,560px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,620px)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(520px,680px)]">
      {/* Panel kiri — permukaan kertas (menggantikan gradient biru). */}
      <section className="relative hidden overflow-hidden bg-muted lg:flex lg:flex-col lg:justify-between">
        {/* Grid kertas halus sebagai tekstur. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.6]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(5,9,20,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(5,9,20,0.05) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 pb-12 text-center xl:px-14">
          <Link
            to="/"
            aria-label="Ke beranda Doscom University"
            className="inline-flex rounded-2xl outline-none transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/40 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <LogoDu className="size-20 text-primary sm:size-24 xl:size-28" />
          </Link>

          {heading ? (
            <h2 className="font-display mt-8 max-w-lg text-3xl font-bold tracking-tight text-foreground sm:text-4xl xl:leading-tight">
              {heading}
            </h2>
          ) : null}
          {subheading ? (
            <p className="font-display mt-4 max-w-lg text-lg font-medium leading-snug text-muted-foreground sm:text-xl sm:leading-snug">
              {subheading}
            </p>
          ) : null}
        </div>

        <div className="relative z-10 px-10 pb-8 text-xs text-muted-foreground xl:px-14">
          Platform pembelajaran digital untuk mahasiswa, mentor, dan admin.
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 xl:px-14 2xl:px-20">
        <div className="w-full">
          {children}
        </div>
      </section>
    </main>
  )
}
