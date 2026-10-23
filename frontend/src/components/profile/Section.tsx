import type { ReactNode } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'

import { SettingsSocialSection } from '@/components/profile/SettingsSocialSection'
import { SettingsThemeSection } from '@/components/profile/SettingsThemeSection'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength'
import { UserAvatarImage } from '@/components/shared/UserAvatarImage'
import { Button } from '@/components/ui/button'
import { navbarUserRoleLabel } from '@/lib/layout/navbar-user-display'
import { initialsFromName } from '@/lib/profile/profile-formatters'
import type { ProfileSectionShellProps } from '@/lib/profile/profile-section-view-model'
import { settingsLayout } from '@/lib/profile/settings-layout'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'

function SettingsCardHeader({
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

function FormActions({ children }: { children: ReactNode }) {
  return <div className={settingsLayout.formActions}>{children}</div>
}

function PersonalRow({
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

export default function ProfileSection({ view }: ProfileSectionShellProps) {
  const {
    user,
    displayName,
    onDisplayNameChange,
    currentPassword,
    onCurrentPasswordChange,
    newPassword,
    onNewPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    isPhotoPending,
    isProfilePending,
    isPasswordPending,
    onPhotoChange,
    onSubmitProfile,
    onSubmitPassword,
  } = view

  const roleLabel = navbarUserRoleLabel[user.role]

  return (
    <section className={settingsLayout.page}>
      <header className="flex flex-col gap-1 pb-1">
        <h1 className={settingsLayout.pageTitle}>Pengaturan</h1>
        <p className={settingsLayout.pageSubtitle}>
          Kelola foto profil, informasi pribadi, media sosial, tema tampilan, dan keamanan
          akun Anda.
        </p>
      </header>

      <div className={settingsLayout.cardLg}>
        <SettingsCardHeader
          title="Foto profil"
          description="Foto ini ditampilkan di navbar, dashboard, dan aktivitas Anda di platform."
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className={cn(settingsLayout.avatarFrame, 'h-28 w-28 sm:h-32 sm:w-32')}>
            <div className={settingsLayout.avatarInner}>
              <UserAvatarImage
                src={user.avatar_url}
                alt={user.name}
                size={120}
                className="h-full w-full rounded-lg bg-note-mint/50"
                fallbackInitial={initialsFromName(user.name)}
                fallbackClassName={settingsLayout.avatarFallback}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className={settingsLayout.meta}>
              Unggah gambar persegi. Format JPEG, PNG, atau GIF — maks. ukuran mengikuti
              kebijakan server.
            </p>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={onPhotoChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              aria-disabled={isPhotoPending}
              className={cn(settingsLayout.outlineButton, 'w-fit')}
            >
              {isPhotoPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ImageIcon className="size-4" aria-hidden />
              )}
              {isPhotoPending ? 'Mengunggah…' : 'Ubah foto profil'}
            </label>
          </div>
        </div>
      </div>

      <div className={settingsLayout.cardLg}>
        <SettingsCardHeader
          title="Pengaturan pribadi"
          description="Detail akun Anda dan nama yang tampil di seluruh platform."
        />
        <form onSubmit={onSubmitProfile} className="flex flex-col gap-5">
          <div className={settingsLayout.personalRows}>
            <PersonalRow
              label="Nama tampilan"
              hint="Digunakan di navbar, sertifikat, dan interaksi dengan pengguna lain."
            >
              <Input
                id="settings-display-name"
                type="text"
                value={displayName}
                onChange={(event) => onDisplayNameChange(event.target.value)}
                className={settingsLayout.input}
                aria-label="Nama tampilan"
              />
            </PersonalRow>
            <PersonalRow
              label="Email login"
              hint="Untuk mengganti email, gunakan kartu Alamat email di bawah."
            >
              <p className={settingsLayout.personalRowValue}>{user.email}</p>
            </PersonalRow>
            <PersonalRow label="Peran akun">
              <div className="flex sm:justify-end">
                <span className={settingsLayout.roleBadge}>{roleLabel}</span>
              </div>
            </PersonalRow>
          </div>
          <FormActions>
            <Button
              type="submit"
              disabled={isProfilePending}
              className={settingsLayout.primaryButton}
            >
              {isProfilePending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan perubahan
            </Button>
          </FormActions>
        </form>
      </div>

      <SettingsSocialSection userUid={user.uid} />

      <SettingsThemeSection />

      <div className={settingsLayout.securityGrid}>
        <div className={settingsLayout.cardLg}>
          <SettingsCardHeader
            title="Kata sandi"
            description="Gunakan password unik yang sulit ditebak."
          />
          <form onSubmit={onSubmitPassword} className={settingsLayout.formStack}>
            <div className={settingsLayout.formSingleColumn}>
              <div className={settingsLayout.fieldStack}>
                <label className={settingsLayout.fieldLabelMd} htmlFor="settings-current-pw">
                  Password saat ini
                </label>
                <Input
                  id="settings-current-pw"
                  type="password"
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(event) => onCurrentPasswordChange(event.target.value)}
                  autoComplete="current-password"
                  className={settingsLayout.input}
                />
              </div>
              <div className={settingsLayout.fieldStack}>
                <label className={settingsLayout.fieldLabelMd} htmlFor="settings-new-pw">
                  Password baru
                </label>
                <Input
                  id="settings-new-pw"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(event) => onNewPasswordChange(event.target.value)}
                  autoComplete="new-password"
                  className={settingsLayout.input}
                />
                <PasswordStrengthIndicator password={newPassword} className="mt-1" />
              </div>
              <div className={settingsLayout.fieldStack}>
                <label className={settingsLayout.fieldLabelMd} htmlFor="settings-confirm-pw">
                  Konfirmasi password baru
                </label>
                <Input
                  id="settings-confirm-pw"
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  autoComplete="new-password"
                  className={settingsLayout.input}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword ? (
                  <p className={settingsLayout.errorText}>Password tidak cocok</p>
                ) : null}
              </div>
            </div>
            <FormActions>
              <Button
                type="submit"
                disabled={isPasswordPending}
                className={settingsLayout.primaryButton}
              >
                {isPasswordPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Perbarui password
              </Button>
            </FormActions>
          </form>
        </div>

        <div className={settingsLayout.cardLg}>
          <SettingsCardHeader
            title="Alamat email"
            description="Konfirmasi lewat link di inbox email baru Anda."
          />
          <form className={settingsLayout.formStack}>
            <div className={settingsLayout.formSingleColumn}>
              <div className={settingsLayout.fieldStack}>
                <label className={settingsLayout.fieldLabelMd} htmlFor="settings-new-email">
                  Email baru
                </label>
                <Input
                  id="settings-new-email"
                  type="email"
                  placeholder="nama@email.com"
                  className={settingsLayout.input}
                />
              </div>
              <div className={settingsLayout.fieldStack}>
                <label className={settingsLayout.fieldLabelMd} htmlFor="settings-email-pw">
                  Password saat ini
                </label>
                <Input
                  id="settings-email-pw"
                  type="password"
                  placeholder="Verifikasi identitas Anda"
                  autoComplete="current-password"
                  className={settingsLayout.input}
                />
              </div>
            </div>
            <FormActions>
              <Button type="button" className={settingsLayout.primaryButton}>
                Ajukan perubahan email
              </Button>
            </FormActions>
          </form>
        </div>
      </div>
    </section>
  )
}
