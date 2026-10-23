import { BookOpen, Star } from 'lucide-react'

import {
  UserDetailJoinedCourseCard,
  UserDetailMentoredCourseCard,
  UserDetailReviewCard,
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
    <div className="space-y-4">
      <h2 className={userDetailLayout.sectionTitle}>Informasi profil</h2>
      <dl className="grid gap-3.5 sm:grid-cols-2">
        <div className={userDetailLayout.fieldCard}>
          <dt className={userDetailLayout.fieldLabel}>Nama</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.name}</dd>
        </div>
        <div className={userDetailLayout.fieldCard}>
          <dt className={userDetailLayout.fieldLabel}>Email</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.email}</dd>
        </div>
        <div className={userDetailLayout.fieldCard}>
          <dt className={userDetailLayout.fieldLabel}>Role</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.roleLabel}</dd>
        </div>
        <div className={userDetailLayout.fieldCard}>
          <dt className={userDetailLayout.fieldLabel}>Verifikasi email</dt>
          <dd className="mt-1.5">
            <UserStatusBadge isVerified={profile.isVerified} />
          </dd>
        </div>
        <div className={`${userDetailLayout.fieldCard} sm:col-span-2`}>
          <dt className={userDetailLayout.fieldLabel}>Bergabung</dt>
          <dd className={userDetailLayout.fieldValue}>{profile.createdAtLabel}</dd>
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
    </div>
  )
}
