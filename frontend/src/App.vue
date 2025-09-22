<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import LoginForm from './components/LoginForm.vue'
import LogoutButton from './components/LogoutButton.vue'
import PostLoginMenu from './components/PostLoginMenu.vue'
import RegisterForm from './components/RegisterForm.vue'
import TodoApp from './components/TodoApp.vue'

type ApiUser = {
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const error = ref('')
const showRegister = ref(false)
const selectedApp = ref<'todo' | 'poll' | null>(null)
const user = ref<ApiUser | null>(null)

const isLoggedIn = computed(() => user.value !== null)
const activeUserLabel = computed(() => user.value?.name ?? user.value?.email ?? '')

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
      selectedApp.value = null
    }
  } catch (fetchError) {
    console.error(fetchError)
  }
}

const handleLoginSuccess = (signedInUser: ApiUser) => {
  user.value = signedInUser
  error.value = ''
  showRegister.value = false
  selectedApp.value = null
}

const handleLogoutSuccess = () => {
  user.value = null
  error.value = ''
  showRegister.value = false
  selectedApp.value = null
}

const handleRegisterSuccess = (registeredUser: ApiUser) => {
  user.value = registeredUser
  error.value = ''
  showRegister.value = false
  selectedApp.value = null
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

const handleAppSelection = (app: 'todo' | 'poll') => {
  selectedApp.value = app
  error.value = ''
}

const resetAppSelection = () => {
  selectedApp.value = null
  error.value = ''
}

onMounted(fetchUser)
</script>

<template>
  <main class="container">
    <section class="card" :class="{ 'card--wide': isLoggedIn && selectedApp }">
      <h1 class="title">Sanctum Login</h1>

      <template v-if="!isLoggedIn">
        <LoginForm v-if="!showRegister" @success="handleLoginSuccess" @error="handleError" />

        <RegisterForm v-else @success="handleRegisterSuccess" @error="handleError" />

        <div class="toggle">
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
      </template>

      <template v-else>
        <div class="post-login">
          <header class="post-login__header">
            <div class="post-login__identity">
              <p class="post-login__welcome">Welcome back</p>
              <p class="post-login__user">{{ activeUserLabel }}</p>
            </div>
            <LogoutButton @success="handleLogoutSuccess" @error="handleError" />
          </header>

          <div v-if="!selectedApp" class="post-login__menu">
            <PostLoginMenu @select="handleAppSelection" />
          </div>

          <div v-else class="post-login__app">
            <button class="link link--back" type="button" @click="resetAppSelection">
              ← Back to menu
            </button>

            <TodoApp v-if="selectedApp === 'todo'" @error="handleError" />

            <div v-else class="placeholder">
              <p>Poll app is coming soon.</p>
            </div>
          </div>
        </div>
      </template>

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
  width: min(420px, 100%);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.card--wide {
  width: min(960px, 100%);
}

.title {
  margin: 0;
  text-align: center;
  font-size: 1.5rem;
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

.link--back {
  justify-self: flex-start;
  margin-bottom: 1rem;
}

.error {
  margin: 0;
  text-align: center;
  color: #b91c1c;
}

.post-login {
  display: grid;
  gap: 2rem;
}

.post-login__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.post-login__identity {
  display: grid;
  gap: 0.2rem;
}

.post-login__welcome {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.post-login__user {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.post-login__menu {
  display: flex;
  justify-content: center;
}

.post-login__app {
  display: grid;
  gap: 1.5rem;
}

.placeholder {
  display: grid;
  place-items: center;
  min-height: 200px;
  border: 1px dashed #cbd5f5;
  border-radius: 12px;
  color: #6b7280;
}

@media (max-width: 860px) {
  .card--wide {
    width: 100%;
  }

  .post-login__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .link--back {
    margin-bottom: 0.5rem;
  }
}
</style>
