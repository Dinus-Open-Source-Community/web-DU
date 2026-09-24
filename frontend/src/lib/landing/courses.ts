export type StaticCourseAccent = 'yellow' | 'mint' | 'peach' | 'pink' | 'sky' | 'lavender'

/** Ikon program: 'nextjs'/'laravel' = logo brand (Simple Icons), 'palette'/'container' = lucide. */
export type StaticCourseIconKey = 'nextjs' | 'laravel' | 'palette' | 'container'

export type StaticCourse = {
  title: string
  desc: string
  level: 'Pemula' | 'Menengah' | 'Semua level'
  accent: StaticCourseAccent
  icon: StaticCourseIconKey
}

/** Program unggulan DOSCOM. Next.js & Laravel sama-sama kelas Web, tapi beda
 *  kelas & stack — ditampilkan sebagai dua program terpisah. */
export const LANDING_COURSES: StaticCourse[] = [
  {
    title: 'Web Development: Next.js',
    desc: 'React untuk produksi — server & client components, routing, API route, sampai deploy.',
    level: 'Menengah',
    accent: 'yellow',
    icon: 'nextjs',
  },
  {
    title: 'Web Development: Laravel',
    desc: 'PHP modern dengan MVC, Eloquent, autentikasi, dan REST API — dari nol sampai aplikasi jalan.',
    level: 'Pemula',
    accent: 'mint',
    icon: 'laravel',
  },
  {
    title: 'UI/UX Design',
    desc: 'Riset pengguna, wireframe, sampai prototipe interaktif — desain yang enak dilihat dan gampang dipakai.',
    level: 'Pemula',
    accent: 'pink',
    icon: 'palette',
  },
  {
    title: 'DevOps',
    desc: 'Docker, CI/CD, dan monitoring — bawa aplikasi dari lokal sampai produksi yang stabil.',
    level: 'Menengah',
    accent: 'sky',
    icon: 'container',
  },
]
