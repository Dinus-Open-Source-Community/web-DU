import { ROUTES } from '@/lib/routes'

export type TerminalLineKind = 'cmd' | 'out' | 'link'

export type TerminalLine = {
  id: number
  text: string
  kind: TerminalLineKind
  href?: string
  label?: string
}

export type TerminalCommandDef = {
  desc: string
  out: string[]
  cta?: { label: string; href: string }
}

export const TERMINAL_BOOT: string[] = [
  'doscomOS v2.0 — terminal komunitas.',
  "ketik 'help' atau klik perintah di bawah.",
]

export const TERMINAL_COMMANDS: Record<string, TerminalCommandDef> = {
  help: {
    desc: 'lihat daftar perintah',
    out: [
      'perintah tersedia:',
      'whoami — siapa kamu di sini',
      'join — cara gabung',
      'sprint — alur sprint',
      'stack — teknologi kami',
    ],
  },
  whoami: {
    desc: 'cek identitasmu',
    out: ['calon kontributor open source.', 'status: belum merge PR pertama.'],
  },
  join: {
    desc: 'cara gabung DOSCOM',
    out: ['1. daftar akun', '2. pilih kursus atau langsung nimbrung', '3. ikut sprint pertamamu'],
    cta: { label: 'Daftar sekarang →', href: ROUTES.register },
  },
  sprint: {
    desc: 'alur sprint belajar',
    out: ['belajar → build → review → launch.', 'setiap sprint didampingi mentor dan ditutup code review.'],
  },
  stack: {
    desc: 'teknologi yang dipakai',
    out: ['react 19 · typescript · tailwind · go + gin · postgresql · minio · docker'],
  },
}

export const TERMINAL_SUDO = 'kamu belum jadi maintainer. ikut sprint dulu.'

export function unknownCommand(cmd: string): string {
  return `'${cmd}': perintah tidak dikenal. coba 'help'.`
}
