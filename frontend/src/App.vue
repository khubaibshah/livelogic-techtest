<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import LoginForm from './components/LoginForm.vue'
import LogoutButton from './components/LogoutButton.vue'
import RegisterForm from './components/RegisterForm.vue'

type ApiUser = {
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const error = ref('')
const showRegister = ref(false)
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
  showRegister.value = false
}

const handleLogoutSuccess = () => {
  user.value = null
  error.value = ''
  showRegister.value = false
}

const handleRegisterSuccess = (registeredUser: ApiUser) => {
  user.value = registeredUser
  error.value = ''
  showRegister.value = false
}

const handleError = (message: string) => {
  error.value = message
}

const showLoginForm = () => {
  showRegister.value = false
  error.value = ''
}

const showRegisterForm = () => {
  showRegister.value = true
  error.value = ''
}

onMounted(fetchUser)
</script>

<template>
  <main class="container">
    <section class="card">
      <h1 class="title">Sanctum Login</h1>

      <p v-if="isLoggedIn" class="status">You are logged in.</p>

      <LoginForm
        v-if="!isLoggedIn && !showRegister"
        @success="handleLoginSuccess"
        @error="handleError"
      />

      <RegisterForm
        v-else-if="!isLoggedIn"
        @success="handleRegisterSuccess"
        @error="handleError"
      />

      <LogoutButton
        v-else
        @success="handleLogoutSuccess"
        @error="handleError"
      />

      <div v-if="!isLoggedIn" class="toggle">
        <button
          v-if="showRegister"
          class="link"
          type="button"
          @click="showLoginForm"
        >
          Already have an account? Login
        </button>
        <button
          v-else
          class="link"
          type="button"
          @click="showRegisterForm"
        >
          Need an account? Register
        </button>
      </div>

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

.toggle {
  display: flex;
  justify-content: center;
}

.link {
  background: none;
  border: none;
  color: #4f46e5;
  font: inherit;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.error {
  margin: 0;
  text-align: center;
  color: #b91c1c;
}
</style>
