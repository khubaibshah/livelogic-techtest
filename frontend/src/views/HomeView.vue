<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import SignOutButton from '../components/SignOutButton.vue'
import PostLoginMenu from '../components/PostLoginMenu.vue'
import TodoApp from '../components/TodoApp.vue'

type ApiUser = {
  name: string
  email: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const error = ref('')
const loadingUser = ref(true)
const showRegister = ref(false)
const selectedApp = ref<'todo' | 'poll' | null>(null)
const user = ref<ApiUser | null>(null)

const isLoggedIn = computed(() => user.value !== null)
const activeUserLabel = computed(() => user.value?.name ?? user.value?.email ?? '')
const avatarLabel = computed(() => (activeUserLabel.value ? activeUserLabel.value.charAt(0).toUpperCase() : '?'))

const authTabIndex = computed({
  get: () => (showRegister.value ? 1 : 0),
  set: (index: number) => {
    showRegister.value = index === 1
    error.value = ''
  },
})

const fetchUser = async () => {
  loadingUser.value = true

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
  } finally {
    loadingUser.value = false
  }
}

const handleLoginSuccess = (signedInUser: ApiUser) => {
  user.value = signedInUser
  showRegister.value = false
  selectedApp.value = null
  authTabIndex.value = 0
  error.value = ''
}

const handleLogoutSuccess = () => {
  user.value = null
  showRegister.value = false
  selectedApp.value = null
  authTabIndex.value = 0
  error.value = ''
}

const handleRegisterSuccess = (registeredUser: ApiUser) => {
  user.value = registeredUser
  showRegister.value = false
  selectedApp.value = null
  authTabIndex.value = 0
  error.value = ''
}

const handleError = (message: string) => {
  error.value = message
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
  <main class="home">
    <div class="home__grid">
      <section class="home__hero">
        <div class="home__badges">
          <Tag icon="pi pi-lock" value="Laravel Sanctum" severity="contrast" />
          <Tag icon="pi pi-sparkles" value="By Muhammad Khubaib" severity="info" />
        </div>
        <h1 class="home__title">LiveLogic</h1>
        <p class="home__subtitle">
          Manage authentication, explore mini apps, and keep your tasks organised with a refined PrimeVue UI layer.
        </p>
      </section>

      <Card class="home__card">
        <template #content>
          <div v-if="loadingUser" class="home__loading">
            <i class="pi pi-spin pi-spinner home__spinner" aria-hidden="true" />
            <p class="home__status">Checking for an active session...</p>
          </div>

          <template v-else>
            <div v-if="!isLoggedIn" class="home__auth">
              <TabView v-model:activeIndex="authTabIndex" class="home__tabs">
                <TabPanel header="Login">
                  <LoginForm @success="handleLoginSuccess" @error="handleError" />
                </TabPanel>
                <TabPanel header="Register">
                  <RegisterForm @success="handleRegisterSuccess" @error="handleError" />
                </TabPanel>
              </TabView>
            </div>

            <div v-else class="home__dashboard">
              <div class="home__header">
                <div class="home__identity">
                  <span class="home__avatar" aria-hidden="true">{{ avatarLabel }}</span>
                  <div>
                    <p class="home__welcome">Welcome back</p>
                    <h2 class="home__user">{{ activeUserLabel }}</h2>
                  </div>
                </div>
                <SignOutButton @success="handleLogoutSuccess" @error="handleError" />
              </div>

              <Divider class="home__divider" />

              <div v-if="!selectedApp" class="home__menu">
                <PostLoginMenu @select="handleAppSelection" />
              </div>

              <div v-else class="home__app">
                <Button
                  link
                  icon="pi pi-arrow-left"
                  label="Back to apps"
                  class="home__back"
                  @click="resetAppSelection"
                />

                <Card class="home__app-card">
                  <template #title>
                    {{ selectedApp === 'todo' ? 'To-Do Workspace' : 'Polls Workspace' }}
                  </template>
                  <template #content>
                    <TodoApp v-if="selectedApp === 'todo'" @error="handleError" />
                    <Message v-else severity="info" :closable="false" text="Poll app is coming soon." />
                  </template>
                </Card>
              </div>
            </div>
          </template>

          <Message v-if="error" severity="error" :closable="false" class="home__error">
            {{ error }}
          </Message>
        </template>
      </Card>
    </div>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  display: flex;
  justify-content: center;
}

.home__grid {
  width: 100%;
  max-width: 1180px;
  display: grid;
  gap: 2.5rem;
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.home__hero {
  display: grid;
  gap: 1.2rem;
  align-content: start;
  padding-top: 0.5rem;
}

.home__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.home__title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 700;
}

.home__subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 1.05rem;
  max-width: 32rem;
}

.home__card {
  width: 100%;
}

.home__loading {
  display: grid;
  gap: 1rem;
  justify-items: center;
  padding: 1.5rem 0;
}

.home__spinner {
  font-size: 2.2rem;
  color: #4f46e5;
}

.home__status {
  margin: 0;
  color: #6b7280;
}

.home__auth {
  padding-top: 0.5rem;
}

.home__tabs :deep(.p-tabview-panel) {
  padding: 1.2rem 0 0;
}

.home__dashboard {
  display: grid;
  gap: 1.5rem;
}

.home__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.home__identity {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.home__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.home__welcome {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.home__user {
  margin: 0;
  font-size: 1.3rem;
}

.home__divider {
  margin: 0;
}

.home__menu {
  padding-block: 0.2rem;
}

.home__app {
  display: grid;
  gap: 1.2rem;
}

.home__app-card :deep(.p-card-content) {
  padding-top: 0.5rem;
}

.home__error {
  margin-top: 1.2rem;
}

@media (max-width: 640px) {
  .home__grid {
    gap: 2rem;
  }

  .home__hero {
    order: 2;
  }

  .home__card {
    order: 1;
  }
}
</style>
