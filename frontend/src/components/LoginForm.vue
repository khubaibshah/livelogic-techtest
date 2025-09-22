<script setup lang="ts">
import { ref } from 'vue'

type ApiUser = {
  name: string
  email: string
}

const emit = defineEmits<{
  (e: 'success', user: ApiUser): void
  (e: 'error', message: string): void
}>()

const email = ref('')
const password = ref('')
const remember = ref(true)
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

const login = async () => {
  loading.value = true
  emit('error', '')

  try {
    await ensureCsrfCookie()

    const token = getXsrfToken()

    if (!token) {
      throw new Error('Unable to establish CSRF token.')
    }

    const response = await fetch(API_BASE_URL + '/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-XSRF-TOKEN': token,
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        remember: remember.value,
      }),
    })

    if (!response.ok) {
      const problem = await response.json().catch(() => null)
      throw new Error(problem?.message ?? 'Login failed.')
    }

    const data = (await response.json()) as { user: ApiUser }
    emit('success', data.user)
    password.value = ''
  } catch (submitError) {
    const message = submitError instanceof Error ? submitError.message : 'Something went wrong.'
    emit('error', message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="login">
    <label class="field">
      <span>Email</span>
      <input v-model="email" type="email" autocomplete="email" required />
    </label>

    <label class="field">
      <span>Password</span>
      <input v-model="password" type="password" autocomplete="current-password" required />
    </label>

    <label class="remember">
      <input v-model="remember" type="checkbox" />
      <span>Remember me</span>
    </label>

    <button class="primary" type="submit" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field span {
  font-size: 0.9rem;
  font-weight: 600;
}

.field input {
  border-radius: 8px;
  border: 1px solid #cdd0d4;
  padding: 0.7rem 0.9rem;
  font-size: 1rem;
}

.field input:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 1px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

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

.primary {
  background: #4f46e5;
  color: #fff;
}
</style>
