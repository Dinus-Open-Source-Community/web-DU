import type { SegmentedItem } from '@/lib/types/components/forms'
import type {
  ManagedUserDetailJoinedCourse,
  ManagedUserDetailMentoredCourse,
  ManagedUserDetailReview,
  ManagedUserDetailTab,
  ManagedUserDetailTransaction,
  ManagedUserDetailViewModel,
} from './user-detail-types'

const TAB_LABELS: Record<ManagedUserDetailTab, string> = {
  profile: 'Profil',
  courses: 'Kursus diikuti',
  mentored: 'Kursus diajar',
  reviews: 'Ulasan',
  transactions: 'Transaksi',
}

const EMPTY_STATE_COPY: Record<
  Exclude<ManagedUserDetailTab, 'profile'>,
  { title: string; description: string }
> = {
  courses: {
    title: 'Belum mengikuti kursus',
    description: 'Siswa ini belum memiliki enrollment aktif.',
  },
  mentored: {
    title: 'Belum mengajar kursus',
    description: 'Mentor ini belum terhubung ke kursus manapun.',
  },
  reviews: {
    title: 'Belum ada ulasan',
    description: 'User ini belum memberikan atau menerima ulasan kursus.',
  },
  transactions: {
    title: 'Belum ada transaksi',
    description: 'Riwayat pembayaran untuk user ini masih kosong.',
  },
}

export function buildUserDetailSectionOptions(
  tabs: ManagedUserDetailTab[],
): SegmentedItem<ManagedUserDetailTab>[] {
  return tabs.map((tab) => ({
    value: tab,
    label: TAB_LABELS[tab],
  }))
}

export function getUserDetailSectionLabel(tab: ManagedUserDetailTab) {
  return TAB_LABELS[tab]
}

export type UserDetailSectionItems =
  | { kind: 'profile' }
  | { kind: 'courses'; items: ManagedUserDetailJoinedCourse[] }
  | { kind: 'mentored'; items: ManagedUserDetailMentoredCourse[] }
  | { kind: 'reviews'; items: ManagedUserDetailReview[] }
  | { kind: 'transactions'; items: ManagedUserDetailTransaction[] }

export function resolveUserDetailSectionItems(
  viewModel: ManagedUserDetailViewModel,
  section: ManagedUserDetailTab,
): UserDetailSectionItems {
  switch (section) {
    case 'profile':
      return { kind: 'profile' }
    case 'courses':
      return { kind: 'courses', items: viewModel.joinedCourses }
    case 'mentored':
      return { kind: 'mentored', items: viewModel.mentoredCourses }
    case 'reviews':
      return { kind: 'reviews', items: viewModel.reviews }
    case 'transactions':
      return { kind: 'transactions', items: viewModel.transactions }
    default:
      return { kind: 'profile' }
  }
}

export function getUserDetailEmptyState(section: ManagedUserDetailTab) {
  if (section === 'profile') return null
  return EMPTY_STATE_COPY[section]
}
