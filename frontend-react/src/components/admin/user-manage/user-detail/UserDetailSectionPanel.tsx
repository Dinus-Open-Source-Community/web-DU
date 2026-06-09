import { BookOpen, Star } from 'lucide-react'

import {
  UserDetailJoinedCourseCard,
  UserDetailMentoredCourseCard,
  UserDetailReviewCard,
  UserDetailTransactionCard,
} from '@/components/admin/user-manage/user-detail/UserDetailListCards'
import { UserStatusBadge } from '@/components/admin/user-manage/UserStatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import { getUserDetailEmptyState } from '@/lib/user-manage/user-detail-navigation'
import type { UserDetailSectionItems } from '@/lib/user-manage/user-detail-navigation'
import type { ManagedUserDetailViewModel } from '@/lib/user-manage/user-detail-types'

type UserDetailSectionPanelProps = {
  sectionContent: UserDetailSectionItems
  viewModel: ManagedUserDetailViewModel
}

function UserDetailProfilePanel({ viewModel }: { viewModel: ManagedUserDetailViewModel }) {
  const { profile } = viewModel

  return (
    <div className="space-y-5">
      <h2 className={userDetailLayout.sectionTitle}>Informasi profil</h2>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className={userDetailLayout.fieldLabel}>Nama</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.name}</dd>
        </div>
        <div>
          <dt className={userDetailLayout.fieldLabel}>Email</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.email}</dd>
        </div>
        <div>
          <dt className={userDetailLayout.fieldLabel}>Role</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.roleLabel}</dd>
        </div>
        <div>
          <dt className={userDetailLayout.fieldLabel}>Status verifikasi</dt>
          <dd className="mt-1">
            <UserStatusBadge status={profile.status} />
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={userDetailLayout.fieldLabel}>Deskripsi</dt>
          <dd className={userDetailLayout.fieldValueMuted}>
            {profile.description ?? 'Belum ada deskripsi profil.'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function UserDetailEmptySection({ section }: { section: Exclude<UserDetailSectionItems['kind'], 'profile'> }) {
  const copy = getUserDetailEmptyState(section)
  if (!copy) return null

  const icon =
    section === 'reviews' ? (
      <Star className="h-5 w-5" aria-hidden />
    ) : (
      <BookOpen className="h-5 w-5" aria-hidden />
    )

  return <EmptyState icon={icon} title={copy.title} description={copy.description} />
}

export function UserDetailSectionPanel({ sectionContent, viewModel }: UserDetailSectionPanelProps) {
  if (sectionContent.kind === 'profile') {
    return <UserDetailProfilePanel viewModel={viewModel} />
  }

  if (sectionContent.items.length === 0) {
    return <UserDetailEmptySection section={sectionContent.kind} />
  }

  return (
    <div className={userDetailLayout.list}>
      {sectionContent.kind === 'courses'
        ? sectionContent.items.map((course) => (
            <UserDetailJoinedCourseCard key={course.uid} course={course} />
          ))
        : null}

      {sectionContent.kind === 'mentored'
        ? sectionContent.items.map((course) => (
            <UserDetailMentoredCourseCard key={course.uid} course={course} />
          ))
        : null}

      {sectionContent.kind === 'reviews'
        ? sectionContent.items.map((review) => (
            <UserDetailReviewCard key={review.uid} review={review} />
          ))
        : null}

      {sectionContent.kind === 'transactions'
        ? sectionContent.items.map((transaction) => (
            <UserDetailTransactionCard key={transaction.uid} transaction={transaction} />
          ))
        : null}
    </div>
  )
}
