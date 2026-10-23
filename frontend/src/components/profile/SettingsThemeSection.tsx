import { Check, Moon, Sun } from 'lucide-react'

import { useAppTheme } from '@/providers/theme-provider'
import type { AppTheme } from '@/lib/theme/app-theme'
import {
  appSegmentedControlClassName,
  appSegmentedItemActiveClassName,
  appSegmentedItemIdleClassName,
} from '@/lib/design/app-shell-tokens'
import { settingsLayout } from '@/lib/profile/settings-layout'
import { cn } from '@/lib/utils'

const themeOptions: {
  id: AppTheme
  label: string
  description: string
  icon: typeof Sun
}[] = [
  {
    id: 'light',
    label: 'Tema putih',
    description: 'Latar terang dengan kontras ink/paper standar.',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Tema gelap',
    description: 'Latar gelap untuk mengurangi silau di malam hari.',
    icon: Moon,
  },
]

/** Warna tetap — tidak memakai token ink/paper agar preview benar di tema aktif mana pun. */
function ThemePreviewSwatch({ variant }: { variant: AppTheme }) {
  if (variant === 'light') {
    return (
      <span
        className="flex h-10 w-full items-stretch gap-1.5 rounded-md border border-[#E5E8EC] bg-[#FBFCFD] p-1.5"
        aria-hidden
      >
        <span className="w-[22%] rounded-sm border border-[#E5E8EC] bg-[#FFFFFF]" />
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <span className="h-1.5 w-[55%] rounded-sm bg-[#050914]" />
          <span className="h-1.5 w-full rounded-sm bg-[#F1F3F5]" />
        </span>
        <span className="w-2.5 shrink-0 self-center rounded-sm bg-[#13A8FF]" />
      </span>
    )
  }

  return (
    <span
      className="flex h-10 w-full items-stretch gap-1.5 rounded-md border border-[#3f3f46] bg-[#09090b] p-1.5"
      aria-hidden
    >
      <span className="w-[22%] rounded-sm border border-[#3f3f46] bg-[#18181b]" />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="h-1.5 w-[55%] rounded-sm bg-[#fafafa]" />
        <span className="h-1.5 w-full rounded-sm bg-[#27272a]" />
      </span>
      <span className="w-2.5 shrink-0 self-center rounded-sm bg-[#13A8FF]" />
    </span>
  )
}

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

export function SettingsThemeSection() {
  const { theme, setTheme } = useAppTheme()

  return (
    <div className={settingsLayout.cardLg}>
      <SettingsCardHeader
        title="Tema"
        description="Pilih tampilan terang atau gelap untuk seluruh aplikasi di perangkat ini."
      />
      <div
        className={cn(
          appSegmentedControlClassName,
          'grid w-full grid-cols-1 gap-2 rounded-xl p-2 sm:grid-cols-2',
        )}
        role="radiogroup"
        aria-label="Pilih tema aplikasi"
      >
        {themeOptions.map((option) => {
          const isActive = theme === option.id
          const Icon = option.icon
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(option.id)}
              className={cn(
                'flex min-h-[5.5rem] flex-col items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                isActive
                  ? cn(
                      appSegmentedItemActiveClassName,
                      'border-brand-blue/40 shadow-none',
                    )
                  : cn(
                      appSegmentedItemIdleClassName,
                      'border-transparent bg-transparent hover:bg-paper-paper/80 dark:hover:bg-paper-paper/20',
                    ),
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  {option.label}
                </span>
                {isActive ? (
                  <span
                    className="flex size-6 items-center justify-center rounded-full bg-ink-900 text-paper-white dark:bg-brand-blue dark:text-ink-900"
                    aria-hidden
                  >
                    <Check className="size-3.5" />
                  </span>
                ) : null}
              </div>
              <ThemePreviewSwatch variant={option.id} />
              <span className="text-xs font-medium leading-relaxed text-ink-500">
                {option.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
