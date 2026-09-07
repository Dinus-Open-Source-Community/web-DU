export type StoryChoice = { label: string; next: string }

export type StoryEnding = {
  title: string
  copy: string
  ctaLabel: string
  ctaHref: string
}

export type StoryNode = {
  id: string
  text: string
  choices: StoryChoice[]
  ending?: StoryEnding
}

export const STORY_START = 'mulai'

export const STORY_NODES: Record<string, StoryNode> = {
  mulai: {
    id: 'mulai',
    text: "Hari pertama. Kamu berdiri di depan sekretariat DOSCOM — laptop di tas, penasaran di kepala. Seorang kakak tingkat menyapa: 'Mau mulai dari mana?'",
    choices: [
      { label: 'Ikut kumpul perdana', next: 'kumpul' },
      { label: 'Langsung buka laptop', next: 'laptop' },
    ],
  },
  kumpul: {
    id: 'kumpul',
    text: 'Ruangan penuh sticky notes dan tawa. Topiknya acak: error semalam, repo baru, siapa yang bawa gorengan. Kamu pulang dengan dua teman baru.',
    choices: [
      { label: 'Ulik repo yang dibahas', next: 'repo' },
      { label: 'Tanya-tanya dulu', next: 'tanya' },
    ],
  },
  laptop: {
    id: 'laptop',
    text: 'Kamu buka editor. Kursor berkedip di file kosong. Semua orang di ruangan ini pernah di titik persis ini — termasuk para mentor.',
    choices: [
      { label: 'Ikut sprint pemula', next: 'sprint' },
      { label: 'Lihat-lihat dulu', next: 'tanya' },
    ],
  },
  repo: {
    id: 'repo',
    text: "PR pertamamu: membetulkan typo di dokumentasi. Kecil? Maintainer-nya me-merge sambil bilang 'thanks!'. Rasanya keterusan.",
    choices: [{ label: 'Lanjutkan →', next: 'ending-oss' }],
  },
  tanya: {
    id: 'tanya',
    text: 'Kamu bertanya sampai paham: sprint itu apa, review itu apa, mulai dari mana. Rasa penasaranmu akhirnya dapat alamat.',
    choices: [{ label: 'Lanjutkan →', next: 'ending-jelajah' }],
  },
  sprint: {
    id: 'sprint',
    text: 'Sprint pertamamu: bikin halaman web untuk acara komunitas. Mentormu me-review tiap baris. Capek. Nagih.',
    choices: [{ label: 'Lanjutkan →', next: 'ending-web' }],
  },
  'ending-oss': {
    id: 'ending-oss',
    text: '',
    choices: [],
    ending: {
      title: 'Kontributor Open Source',
      copy: 'Enam bulan kemudian, namamu ada di daftar kontributor. Portofoliomu bukan janji — bukti yang bisa diklik.',
      ctaLabel: 'Lihat jalur kontribusi',
      ctaHref: '/#kursus',
    },
  },
  'ending-web': {
    id: 'ending-web',
    text: '',
    choices: [],
    ending: {
      title: 'Pengembang Web',
      copy: 'Halaman acaramu live dan dipakai ratusan orang. Baris kodemu ada di internet, bukan cuma di laptop.',
      ctaLabel: 'Lihat jalur web',
      ctaHref: '/#kursus',
    },
  },
  'ending-jelajah': {
    id: 'ending-jelajah',
    text: '',
    choices: [],
    ending: {
      title: 'Penjelajah Jalur',
      copy: 'Masih ragu itu normal. Mulai dari yang paling dasar, pelan-pelan, bareng-bareng.',
      ctaLabel: 'Lihat semua kursus',
      ctaHref: '/#kursus',
    },
  },
}
