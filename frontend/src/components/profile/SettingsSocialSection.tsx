import type { ComponentType, SVGProps } from 'react'
import { useState } from 'react'
import { ExternalLink, Globe, Link2, Mail, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSocialLinks } from '@/hooks/profile/use-social-links'
import {
  BrandGithubIcon,
  BrandInstagramIcon,
  BrandLinkedinIcon,
} from '@/lib/navigation'
import {
  SOCIAL_PLATFORM_OPTIONS,
  socialPlatformLabel,
  type SocialPlatform,
} from '@/lib/profile/social-links'
import { settingsLayout } from '@/lib/profile/settings-layout'
import { cn } from '@/lib/utils'

/** Ikon brand inline (fill=currentColor) — pola yang sama dipakai di lib/navigation. */
function brandIconPath(d: string): ComponentType<SVGProps<SVGSVGElement>> {
  return function BrandIcon({ className }: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={d} />
      </svg>
    )
  }
}

const BrandYoutubeIcon = brandIconPath(
  'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
)

const BrandFacebookIcon = brandIconPath(
  'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
)

const BrandXIcon = brandIconPath(
  'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
)

const BrandTiktokIcon = brandIconPath(
  'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
)

export const SOCIAL_ICONS: Record<SocialPlatform, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: BrandInstagramIcon,
  github: BrandGithubIcon,
  linkedin: BrandLinkedinIcon,
  youtube: BrandYoutubeIcon,
  x: BrandXIcon,
  facebook: BrandFacebookIcon,
  tiktok: BrandTiktokIcon,
  website: Globe,
}

export function SettingsSocialSection({ userUid }: { userUid: string }) {
  const { links, addSocialLink, removeSocialLink } = useSocialLinks(userUid)
  const [platform, setPlatform] = useState<SocialPlatform>('instagram')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const activePlaceholder =
    SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform)?.placeholder ??
    'https://…'

  const handleAdd = () => {
    const result = addSocialLink(platform, url)
    if (!result.ok) {
      setError(result.error)
      setWarning(null)
      return
    }
    setError(null)
    setWarning('warning' in result ? (result.warning ?? null) : null)
    setUrl('')
  }

  return (
    <div className={settingsLayout.cardLg} data-testid="settings-social-section">
      <div className={settingsLayout.cardHeader}>
        <h2 className={settingsLayout.sectionTitle}>Media sosial</h2>
        <p className={settingsLayout.sectionDescription}>
          Tambahkan tautan profil Anda. Pilih jenis platform, tempel URL-nya, lalu simpan —
          ikon platform akan muncul dan bisa diklik untuk menguji tautan di tab baru.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={platform}
            onValueChange={(value) => setPlatform(value as SocialPlatform)}
          >
            <SelectTrigger
              className="w-full sm:w-48"
              aria-label="Jenis media sosial"
              data-testid="social-platform-select"
            >
              <SelectValue placeholder="Pilih platform" />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORM_OPTIONS.map((option) => {
                const Icon = SOCIAL_ICONS[option.value]
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="inline-flex items-center gap-2 align-middle">
                      <Icon className="size-4 shrink-0" />
                      {option.label}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Input
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAdd()
              }
            }}
            placeholder={activePlaceholder}
            aria-label="URL media sosial"
            data-testid="social-url-input"
            className={cn(settingsLayout.input, 'flex-1')}
          />

          <Button
            type="button"
            onClick={handleAdd}
            className={settingsLayout.primaryButton}
            data-testid="social-add-button"
          >
            <Plus className="size-4" aria-hidden />
            Simpan
          </Button>
        </div>

        {error ? (
          <p role="alert" className={settingsLayout.errorText}>
            {error}
          </p>
        ) : null}
        {warning ? (
          <p className="ml-1 text-xs font-medium text-amber-600 dark:text-amber-400">{warning}</p>
        ) : null}
      </div>

      <div className="mt-5">
        {links.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-ink-900/10 bg-paper-paper/60 px-4 py-5">
            <Link2 className="size-5 shrink-0 text-ink-500" aria-hidden />
            <p className="text-sm font-medium text-ink-500">
              Belum ada tautan. Contoh: pilih <span className="font-semibold">Instagram</span>,
              isi <span className="font-semibold">https://instagram.com/username</span>, lalu klik
              Simpan.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5" data-testid="social-links-list">
            {links.map((link) => {
              const Icon = SOCIAL_ICONS[link.platform]
              return (
                <li
                  key={link.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-ink-900/10 bg-paper-white px-3.5 py-3"
                  data-testid={`social-link-item-${link.platform}`}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper-white dark:bg-brand-blue dark:text-ink-900"
                    aria-hidden
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink-900">
                      {socialPlatformLabel(link.platform)}
                    </span>
                    <span className="truncate text-xs font-medium text-ink-500" title={link.url}>
                      {link.url}
                    </span>
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border-2 border-ink-900/10 bg-paper-white px-2.5 text-xs font-semibold text-ink-900 transition-colors hover:bg-paper-paper"
                    aria-label={`Uji tautan ${socialPlatformLabel(link.platform)} (buka di tab baru)`}
                    title="Uji tautan di tab baru"
                    data-testid={`social-link-test-${link.platform}`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Uji
                  </a>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Hapus tautan ${socialPlatformLabel(link.platform)}`}
                    title="Hapus tautan"
                    data-testid={`social-link-remove-${link.platform}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className={cn(settingsLayout.meta, 'mt-4 flex items-center gap-1.5 text-xs')}>
        <Mail className="size-3.5" aria-hidden />
        Tautan tersimpan otomatis di perangkat ini dan tombol Uji selalu membuka tab baru yang
        aman (target=&quot;_blank&quot; + rel=&quot;noopener noreferrer&quot;).
      </p>
    </div>
  )
}
