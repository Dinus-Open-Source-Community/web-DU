import { SegmentedFilter, type SegmentedItem } from '@/components/shared/SegemntedFilter'
import { userDetailLayout } from '@/lib/user-manage/user-detail-layout'
import type { ManagedUserDetailTab } from '@/lib/user-manage/user-detail-types'

type UserDetailSectionFilterProps = {
  value: ManagedUserDetailTab
  items: SegmentedItem<ManagedUserDetailTab>[]
  onChange: (value: ManagedUserDetailTab) => void
}

export function UserDetailSectionFilter({
  value,
  items,
  onChange,
}: UserDetailSectionFilterProps) {
  return (
    <div
      className={userDetailLayout.contentPanelToolbar}
      role="group"
      aria-label="Pilih bagian detail user"
    >
      <SegmentedFilter items={items} value={value} onChange={onChange} variant="scroll" />
    </div>
  )
}
