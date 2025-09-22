<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const loading = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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

const logout = async () => {
  loading.value = true
  emit('error', '')

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
      throw new Error(problem?.message ?? 'Logout failed.')
    }

    emit('success')
  } catch (submitError) {
    const message = submitError instanceof Error ? submitError.message : 'Something went wrong.'
    emit('error', message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button class="secondary" type="button" :disabled="loading" @click="logout">
    {{ loading ? 'Logging out...' : 'Logout' }}
  </button>
</template>

<style scoped>
button {
  height: 2.7rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary {
  background: #e5e7eb;
  color: #111827;
}
</style>
