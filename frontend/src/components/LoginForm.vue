<script setup lang="ts">
import { computed, ref } from 'vue'

import { useLoginRequest } from '../composables/useAuthRequests'

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
const submitAttempted = ref(false)
const touchedEmail = ref(false)
const touchedPassword = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailValidation = computed(() => {
  const value = email.value.trim()

  if (!value) {
    return 'Email is required.'
  }

  if (!emailPattern.test(value)) {
    return 'Enter a valid email address.'
  }

  return ''
})

const passwordValidation = computed(() => {
  if (!password.value) {
    return 'Password is required.'
  }

  if (password.value.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
})

const showEmailError = computed(() => submitAttempted.value || touchedEmail.value)
const showPasswordError = computed(() => submitAttempted.value || touchedPassword.value)

const emailError = computed(() => (showEmailError.value ? emailValidation.value : ''))
const passwordError = computed(() => (showPasswordError.value ? passwordValidation.value : ''))

const formValid = computed(() => !emailValidation.value && !passwordValidation.value)

const { loading, submit } = useLoginRequest({
  onSuccess: (user) => {
    emit('success', user)
    password.value = ''
    submitAttempted.value = false
    touchedEmail.value = false
    touchedPassword.value = false
  },
  onError: (message) => emit('error', message),
})

const login = async () => {
  submitAttempted.value = true

  if (!formValid.value) {
    emit('error', 'Please correct the highlighted fields before continuing.')
    return
  }

  await submit({
    email: email.value,
    password: password.value,
    remember: remember.value,
  })
}
</script>

<template>
  <form class="auth-form" @submit.prevent="login">
    <div class="auth-form__field">
      <label class="auth-form__label" for="login-email">Email</label>
      <InputText
        id="login-email"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        style="width: 100%"
        @blur="touchedEmail = true"
      />
      <small v-if="emailError" class="p-error">{{ emailError }}</small>
    </div>

    <div class="auth-form__field">
      <label class="auth-form__label" for="login-password">Password</label>
      <Password
        id="login-password"
        v-model="password"
        :feedback="false"
        toggleMask
        autocomplete="current-password"
        :input-style="{ width: '100%' }"
        @blur="touchedPassword = true"
      />
      <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
    </div>

    <div class="auth-form__remember">
      <Checkbox inputId="login-remember" v-model="remember" binary />
      <label for="login-remember">Remember me</label>
    </div>

    <Button type="submit" label="Login" icon="pi pi-sign-in" :loading="loading" style="width: 100%" />
  </form>
</template>

<style scoped>
.auth-form {
  display: grid;
  gap: 1.1rem;
}

.auth-form__field {
  display: grid;
  gap: 0.35rem;
}

.auth-form__label {
  font-weight: 600;
  font-size: 0.9rem;
}

.auth-form__remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
</style>
