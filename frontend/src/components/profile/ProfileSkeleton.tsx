import type { ReactNode } from 'react'

import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { AppNavbarProvider } from '@/components/shared/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarUser } from '@/hooks/use-sidebar-user'
import {
  appSegmentedControlClassName,
  appShellPageBgClassName,
} from '@/lib/design/app-shell-tokens'
import { appPageContentClassName } from '@/lib/layout/page-layout'
import { settingsLayout } from '@/lib/profile/settings-layout'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

function SettingsCardHeaderSkeleton({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className={settingsLayout.cardHeader}>
      <h2 className={settingsLayout.sectionTitle}>{title}</h2>
      <p className={settingsLayout.sectionDescription}>{description}</p>
    </div>
  )
}

function PersonalRowSkeleton({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className={settingsLayout.personalRow}>
      <div className={settingsLayout.personalRowCopy}>
        <p className={settingsLayout.personalRowLabel}>{label}</p>
        {hint ? <p className={settingsLayout.personalRowHint}>{hint}</p> : null}
      </div>
      <div className={settingsLayout.personalRowControl}>{children}</div>
    </div>
  )
}

/**
 * Kerangka halaman Pengaturan (`/settings`) yang selaras 1:1 dengan `ProfileSection`:
 * Header statis + kartu Foto profil, Pengaturan pribadi, Media sosial, Tema, serta
 * grid Kata sandi & Alamat email.
 */
export function ProfileSectionSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Memuat pengaturan profil"
      className={settingsLayout.page}
    >
      <span className="sr-only">Memuat pengaturan profil...</span>

      <header className="flex flex-col gap-1 pb-1">
        <h1 className={settingsLayout.pageTitle}>Pengaturan</h1>
        <p className={settingsLayout.pageSubtitle}>
          Kelola foto profil, informasi pribadi, media sosial, tema tampilan, dan keamanan
          akun Anda.
        </p>
      </header>

      {/* Kartu 1: Foto profil */}
      <div className={settingsLayout.cardLg}>
        <SettingsCardHeaderSkeleton
          title="Foto profil"
          description="Foto ini ditampilkan di navbar, dashboard, dan aktivitas Anda di platform."
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className={cn(settingsLayout.avatarFrame, 'h-28 w-28 sm:h-32 sm:w-32')}>
            <div className={settingsLayout.avatarInner}>
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className={settingsLayout.meta}>
              Unggah gambar persegi. Format JPEG, PNG, atau GIF — maks. ukuran mengikuti
              kebijakan server.
            </p>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Kartu 2: Pengaturan pribadi */}
      <div className={settingsLayout.cardLg}>
        <SettingsCardHeaderSkeleton
          title="Pengaturan pribadi"
          description="Detail akun Anda dan nama yang tampil di seluruh platform."
        />
        <div className="flex flex-col gap-5">
          <div className={settingsLayout.personalRows}>
            <PersonalRowSkeleton
              label="Nama tampilan"
              hint="Digunakan di navbar, sertifikat, dan interaksi dengan pengguna lain."
            >
              <Skeleton className="h-10 w-full rounded-xl" />
            </PersonalRowSkeleton>
            <PersonalRowSkeleton
              label="Email login"
              hint="Untuk mengganti email, gunakan kartu Alamat email di bawah."
            >
              <div className="flex sm:justify-end">
                <Skeleton className="h-5 w-48 max-w-full rounded-sm" />
              </div>
            </PersonalRowSkeleton>
            <PersonalRowSkeleton label="Peran akun">
              <div className="flex sm:justify-end">
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </PersonalRowSkeleton>
          </div>
          <div className={settingsLayout.formActions}>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Kartu 3: Media sosial */}
      <div className={settingsLayout.cardLg}>
        <SettingsCardHeaderSkeleton
          title="Media sosial"
          description="Tambahkan tautan profil Anda. Pilih jenis platform, tempel URL-nya, lalu simpan — ikon platform akan muncul dan bisa diklik untuk menguji tautan di tab baru."
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 w-full shrink-0 rounded-xl sm:w-48" />
          <Skeleton className="h-10 w-full flex-1 rounded-xl" />
          <Skeleton className="h-10 w-full shrink-0 rounded-xl sm:w-28" />
        </div>
        <div className="mt-5">
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
        </div>
      </div>

      {/* Kartu 4: Tema */}
      <div className={settingsLayout.cardLg}>
        <SettingsCardHeaderSkeleton
          title="Tema"
          description="Pilih tampilan terang atau gelap untuk seluruh aplikasi di perangkat ini."
        />
        <div
          className={cn(
            appSegmentedControlClassName,
            'grid w-full grid-cols-1 gap-2 rounded-xl p-2 sm:grid-cols-2',
          )}
          aria-hidden
        >
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[5.5rem] flex-col items-start gap-3 rounded-lg border-2 border-transparent px-4 py-3"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <Skeleton className="h-5 w-24 rounded-sm" />
                {index === 0 ? <Skeleton className="size-6 rounded-full" /> : null}
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Kartu 5 & 6: Alamat email + Kata sandi */}
      <div className={settingsLayout.securityGrid}>
        <div className={settingsLayout.cardLg}>
          <SettingsCardHeaderSkeleton
            title="Alamat email"
            description="Tautan konfirmasi untuk mengganti ke alamat email baru akan dikirim ke inbox email lama Anda."
          />
          <div className={settingsLayout.formStack}>
            <div className={settingsLayout.formSingleColumn}>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Alamat email lama</span>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-4 w-4/5 rounded-sm" />
              </div>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Alamat email baru</span>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Password saat ini</span>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className={settingsLayout.formActions}>
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
          </div>
        </div>

        <div className={settingsLayout.cardLg}>
          <SettingsCardHeaderSkeleton
            title="Kata sandi"
            description="Gunakan password unik yang sulit ditebak."
          />
          <div className={settingsLayout.formStack}>
            <div className={settingsLayout.formSingleColumn}>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Password saat ini</span>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Password baru</span>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="mt-1 h-4 w-40 rounded-sm" />
              </div>
              <div className={settingsLayout.fieldStack}>
                <span className={settingsLayout.fieldLabelMd}>Konfirmasi password baru</span>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className={settingsLayout.formActions}>
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Fallback Suspense route `/settings`: membungkus `ProfileSectionSkeleton`
 * dengan `AppNavbarProvider` + `AdminPageShell` agar tidak memakai `PageSkeleton` generik.
 */
export function ProfileRouteFallback() {
  const { role } = useAuth()
  const activeRole = role ?? 'student'
  const sidebarUser = useSidebarUser(activeRole)

  return (
    <AppNavbarProvider
      role={activeRole}
      user={sidebarUser}
      navbarBack="history"
      contentClassName={cn(
        appPageContentClassName,
        appShellPageBgClassName,
        'relative',
      )}
    >
      <AdminPageShell className="gap-0">
        <ProfileSectionSkeleton />
      </AdminPageShell>
    </AppNavbarProvider>
  )
}
