import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Lottie } from '@/components/shared/Lottie'
import { LogoDu } from '@/components/shared/icon'
import { AUTH_LOTTIE_SRC } from '@/components/auth/constants'

type AuthLayoutProps = {
  children: ReactNode
  lottieUrl?: string
  heading?: string
  subheading?: string
}

export default function AuthLayout({
  children,
  lottieUrl = AUTH_LOTTIE_SRC,
  heading,
  subheading,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,560px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,620px)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(520px,680px)]">
      <section
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
        aria-hidden={false}
      >
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#075e9c_0%,#0a84dc_48%,#3aa0e8_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-white/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_42%)]" />

        <div className="relative z-10 flex items-center gap-3 px-10 pt-10 xl:px-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-xl text-white outline-none focus-visible:ring-3 focus-visible:ring-white/30"
          >
            <LogoDu className="size-8 text-white" />
            <span className="text-sm font-semibold tracking-tight text-white/95">
              Doscom University
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 pb-12 text-center xl:px-14">
          {lottieUrl ? (
            <div className="mb-8 size-[min(18rem,42vw)] max-w-72">
              <Lottie src={lottieUrl} className="size-full" />
            </div>
          ) : null}

          {heading ? (
            <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              {heading}
            </h2>
          ) : null}
          {subheading ? (
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78 sm:text-base">
              {subheading}
            </p>
          ) : null}
        </div>

        <div className="relative z-10 px-10 pb-8 text-xs text-white/55 xl:px-14">
          Platform pembelajaran digital untuk mahasiswa, mentor, dan admin.
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 xl:px-14 2xl:px-20">
        <div className="w-full">
          {lottieUrl ? (
            <div className="mx-auto mb-6 flex max-w-md justify-center lg:hidden">
              <div className="flex size-28 items-center justify-center rounded-[28px] border border-border/70 bg-card shadow-sm sm:size-32">
                <Lottie src={lottieUrl} className="size-[5.5rem] sm:size-24" />
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </section>
    </main>
  )
}
