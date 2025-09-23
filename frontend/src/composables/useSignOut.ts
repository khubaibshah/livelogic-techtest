import { ref } from 'vue'

import { sanctumRequest } from './useSanctumClient'

type UseSignOutOptions = {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export const useSignOut = (options: UseSignOutOptions = {}) => {
  const loading = ref(false)

  const emitSuccess = () => {
    options.onSuccess?.()
  }

  const emitError = (message: string) => {
    options.onError?.(message)
  }

  const signOut = async () => {
    if (loading.value) {
      return
    }

    loading.value = true
    emitError('')

    try {
      await sanctumRequest('/logout', { method: 'POST' }, { requireCsrf: true })
      emitSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      emitError(message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    signOut,
  }
}
