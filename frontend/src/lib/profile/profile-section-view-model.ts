import type { ChangeEvent, FormEvent } from 'react'

import type { IAuthSessionUser } from '@/lib/types/auth'

export type ProfileSectionViewModel = {
  user: IAuthSessionUser
  displayName: string
  onDisplayNameChange: (value: string) => void
  newPassword: string
  onNewPasswordChange: (value: string) => void
  confirmPassword: string
  onConfirmPasswordChange: (value: string) => void
  lastUpdatedLabel: string
  isPhotoPending: boolean
  isProfilePending: boolean
  isPasswordPending: boolean
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmitProfile: (event: FormEvent<HTMLFormElement>) => void
  onSubmitPassword: (event: FormEvent<HTMLFormElement>) => void
}

export type ProfileSectionShellProps = {
  view: ProfileSectionViewModel
}
