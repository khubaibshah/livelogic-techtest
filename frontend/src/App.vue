<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type ApiUser = {
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const error = ref('')
const user = ref<ApiUser | null>(null)

const isLoggedIn = computed(() => user.value !== null)

const findCookieValue = (key: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${key}=`))

  return match ? decodeURIComponent(match.split('=')[1]) : null
}

const getXsrfToken = (): string | null => findCookieValue('XSRF-TOKEN')

const ensureCsrfCookie = async () => {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

const fetchUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = (await response.json()) as ApiUser
      user.value = data
    }
  } catch (fetchError) {
    console.error(fetchError)
  }
}

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    await ensureCsrfCookie()

    const token = getXsrfToken()

    if (!token) {
      throw new Error('Unable to establish CSRF token.')
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
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
    user.value = data.user
    password.value = ''
  } catch (submitError) {
    error.value = submitError instanceof Error ? submitError.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  loading.value = true
  error.value = ''

  try {
    if (!getXsrfToken()) {
      await ensureCsrfCookie()
    }

    const token = getXsrfToken()

    const response = await fetch(`${API_BASE_URL}/logout`, {
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

    user.value = null
    email.value = ''
    password.value = ''
  } catch (submitError) {
    error.value = submitError instanceof Error ? submitError.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <main class="container">
    <section class="card">
      <h1 class="title">Sanctum Login</h1>

      <p v-if="isLoggedIn" class="status">You are logged in.</p>

      <form v-if="!isLoggedIn" class="form" @submit.prevent="login">
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

      <button v-else class="secondary" type="button" :disabled="loading" @click="logout">
        {{ loading ? 'Logging out...' : 'Logout' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 2rem;
}

.card {
  width: min(360px, 100%);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.title {
  margin: 0;
  text-align: center;
  font-size: 1.5rem;
}

.status {
  margin: 0;
  text-align: center;
  color: #0a7c4f;
}

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

.secondary {
  background: #e5e7eb;
  color: #111827;
}

.error {
  margin: 0;
  text-align: center;
  color: #b91c1c;
}
</style>
