<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import LoginForm from './components/LoginForm.vue'
import LogoutButton from './components/LogoutButton.vue'

type ApiUser = {
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const error = ref('')
const user = ref<ApiUser | null>(null)

const isLoggedIn = computed(() => user.value !== null)

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

const handleLoginSuccess = (signedInUser: ApiUser) => {
  user.value = signedInUser
  error.value = ''
}

const handleLogoutSuccess = () => {
  user.value = null
  error.value = ''
}

const handleError = (message: string) => {
  error.value = message
}

onMounted(fetchUser)
</script>

<template>
  <main class="container">
    <section class="card">
      <h1 class="title">Sanctum Login</h1>

      <p v-if="isLoggedIn" class="status">You are logged in.</p>

      <LoginForm
        v-if="!isLoggedIn"
        @success="handleLoginSuccess"
        @error="handleError"
      />

      <LogoutButton
        v-else
        @success="handleLogoutSuccess"
        @error="handleError"
      />

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

.error {
  margin: 0;
  text-align: center;
  color: #b91c1c;
}
</style>
