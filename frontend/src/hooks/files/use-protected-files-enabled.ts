import { useSyncExternalStore } from 'react'

import { getApiAuthToken } from '@/services/axios'

const AUTH_CHANGE_EVENT = 'du-auth-change'

function subscribe(onStoreChange: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange)
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange)
}

function getAuthSnapshot() {
  return Boolean(getApiAuthToken())
}

export function useProtectedFilesEnabled() {
  return useSyncExternalStore(subscribe, getAuthSnapshot, getAuthSnapshot)
}
