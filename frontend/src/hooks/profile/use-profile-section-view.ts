import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import {
  useRequestEmailChange,
  useUpdatePassword,
  useUpdateProfile,
  useUpdateProfilePhoto,
} from '@/hooks/use-user'
import type { IUserData } from '@/lib/types/user'
import type { IAuthSessionUser } from '@/lib/types/auth'
import {
  avatarFileSchema,
  changePasswordFormSchema,
  getValidationMessage,
  updateEmailSchema,
  updateProfileSchema,
} from '@/lib/validator'

import type { ProfileSectionViewModel } from '@/lib/profile/profile-section-view-model'

type UseProfileSectionViewOptions = {
  user: IAuthSessionUser
  onAvatarUpdated?: () => Promise<IUserData | null | void>
  onValidationError?: (message: string) => void
}

export function useProfileSectionView({
  user,
  onAvatarUpdated,
  onValidationError,
}: UseProfileSectionViewOptions): ProfileSectionViewModel {
  const [displayName, setDisplayName] = useState(user.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [pendingEmailConfirmationTo, setPendingEmailConfirmationTo] = useState<string | null>(null)

  const { mutateAsync: updatePhoto, isPending: isPhotoPending } = useUpdateProfilePhoto()
  const { mutateAsync: updateProfile, isPending: isProfilePending } = useUpdateProfile()
  const { mutateAsync: updatePassword, isPending: isPasswordPending } = useUpdatePassword()
  const { mutateAsync: requestEmailChange, isPending: isEmailPending } = useRequestEmailChange()

  const onPhotoChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0] || null
      const validation = avatarFileSchema.safeParse(file)
      if (!validation.success) {
        onValidationError?.(getValidationMessage(validation.error, 'Foto profil tidak valid'))
        return
      }

      await updatePhoto(validation.data)
      await onAvatarUpdated?.()
      event.currentTarget.value = ''
    },
    [onAvatarUpdated, onValidationError, updatePhoto],
  )

  const onSubmitProfile = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isProfilePending) return

      const validation = updateProfileSchema.safeParse({ name: displayName })
      if (!validation.success) {
        onValidationError?.(getValidationMessage(validation.error, 'Data profil tidak valid'))
        return
      }

      await updateProfile(validation.data)
    },
    [displayName, isProfilePending, onValidationError, updateProfile],
  )

  const onSubmitPassword = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isPasswordPending) return

      const validation = changePasswordFormSchema.safeParse({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      if (!validation.success) {
        onValidationError?.(getValidationMessage(validation.error, 'Data password tidak valid'))
        return
      }

      await updatePassword({
        old_password: validation.data.old_password,
        new_password: validation.data.new_password,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    [confirmPassword, currentPassword, isPasswordPending, newPassword, onValidationError, updatePassword],
  )

  const onSubmitEmail = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isEmailPending) return

      const trimmedNewEmail = newEmail.trim().toLowerCase()
      const currentEmail = user.email.trim().toLowerCase()
      if (trimmedNewEmail && trimmedNewEmail === currentEmail) {
        onValidationError?.('Alamat email baru tidak boleh sama dengan alamat email lama')
        return
      }

      const validation = updateEmailSchema.safeParse({
        email: newEmail,
        password: emailPassword,
      })
      if (!validation.success) {
        onValidationError?.(getValidationMessage(validation.error, 'Data perubahan email tidak valid'))
        return
      }

      const result = await requestEmailChange({
        new_email: validation.data.email,
        password: validation.data.password,
      })
      setPendingEmailConfirmationTo(result.new_email || validation.data.email)
      setNewEmail('')
      setEmailPassword('')
    },
    [emailPassword, isEmailPending, newEmail, onValidationError, requestEmailChange, user.email],
  )

  useEffect(() => {
    setDisplayName(user.name)
  }, [user.name])

  useEffect(() => {
    setPendingEmailConfirmationTo(null)
  }, [user.email])

  return {
    user,
    displayName,
    onDisplayNameChange: setDisplayName,
    currentPassword,
    onCurrentPasswordChange: setCurrentPassword,
    newPassword,
    onNewPasswordChange: setNewPassword,
    confirmPassword,
    onConfirmPasswordChange: setConfirmPassword,
    newEmail,
    onNewEmailChange: setNewEmail,
    emailPassword,
    onEmailPasswordChange: setEmailPassword,
    pendingEmailConfirmationTo,
    isPhotoPending,
    isProfilePending,
    isPasswordPending,
    isEmailPending,
    onPhotoChange,
    onSubmitProfile,
    onSubmitPassword,
    onSubmitEmail,
  }
}
