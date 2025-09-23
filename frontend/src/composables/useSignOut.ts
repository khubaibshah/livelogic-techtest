import { ref } from 'vue'

type UseSignOutOptions = {
  onSuccess?: () => void
  onError?: (message: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const useSignOut = (options: UseSignOutOptions = {}) => {
  const loading = ref(false)

  const emitSuccess = () => {
    options.onSuccess?.()
  }

  const emitError = (message: string) => {
    options.onError?.(message)
  }

  const findCookieValue = (key: string): string | null => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(key + '='))

    return match ? decodeURIComponent(match.split('=')[1]) : null
  }

  const getXsrfToken = (): string | null => findCookieValue('XSRF-TOKEN')

  const ensureCsrfCookie = async () => {
    await fetch(API_BASE_URL + '/sanctum/csrf-cookie', {
      credentials: 'include',
    })
  }

  const signOut = async () => {
    if (loading.value) {
      return
    }

    loading.value = true
    emitError('')

    try {
      if (!getXsrfToken()) {
        await ensureCsrfCookie()
      }

      const token = getXsrfToken()

      const response = await fetch(API_BASE_URL + '/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': token ?? '',
        },
      })

      if (!response.ok) {
        const problem = await response.json().catch(() => null)
        throw new Error((problem as { message?: string } | null)?.message ?? 'Logout failed.')
      }

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
