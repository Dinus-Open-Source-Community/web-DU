import { useEffect, useMemo, useState } from 'react'

import {
  buildUserDetailSectionOptions,
  resolveUserDetailSectionItems,
} from '@/lib/user-manage/user-detail-navigation'
import type { ManagedUserDetailTab, ManagedUserDetailViewModel } from '@/lib/user-manage/user-detail-types'

export function useUserDetailSection(viewModel: ManagedUserDetailViewModel) {
  const defaultSection = viewModel.tabs[0] ?? 'profile'
  const [activeSection, setActiveSection] = useState<ManagedUserDetailTab>(defaultSection)

  const sectionOptions = useMemo(
    () => buildUserDetailSectionOptions(viewModel.tabs),
    [viewModel.tabs],
  )

  const sectionContent = useMemo(
    () => resolveUserDetailSectionItems(viewModel, activeSection),
    [activeSection, viewModel],
  )

  useEffect(() => {
    setActiveSection(defaultSection)
  }, [defaultSection, viewModel.profile.uid])

  return {
    activeSection,
    setActiveSection,
    sectionOptions,
    sectionContent,
    showSectionFilter: sectionOptions.length > 1,
  }
}
