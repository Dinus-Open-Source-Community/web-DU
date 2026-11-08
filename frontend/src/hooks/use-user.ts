import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  IConfirmEmailChangePayload,
  IRequestEmailChangePayload,
  IUpdatePasswordPayload,
  IUpdateProfilePayload,
} from '@/lib/types/user'
import { Message, resolveApiActionError } from '@/lib/Message'
import {
  confirmUserEmailChange,
  requestUserEmailChange,
  updateUserPassword,
  updateUserProfile,
  uploadProfilePhoto,
} from '@/services/user'
import { authKeys } from './query-keys'

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success(Message.profile.photoUpdated)
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, Message.profile.photoUpdateFailed))
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateUserProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success(Message.profile.updated)
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, Message.profile.updateFailed))
    },
  })
}

export function useUpdatePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IUpdatePasswordPayload) => updateUserPassword(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success(Message.profile.passwordUpdated)
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, Message.profile.passwordUpdateFailed))
    },
  })
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (payload: IRequestEmailChangePayload) => requestUserEmailChange(payload),
    onSuccess: () => {
      toast.success(Message.profile.emailChangeRequested)
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, Message.profile.emailChangeRequestFailed))
    },
  })
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: IConfirmEmailChangePayload) => confirmUserEmailChange(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.session })
      toast.success(Message.profile.emailConfirmed)
    },
    onError: (error) => {
      toast.error(resolveApiActionError(error, Message.profile.emailConfirmFailed))
    },
  })
}
