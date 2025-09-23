<script setup lang="ts">
import { computed, ref } from 'vue'

import { useRegisterRequest } from '../composables/useAuthRequests'

type ApiUser = {
  name: string
  email: string
}

const emit = defineEmits<{
  (e: 'success', user: ApiUser): void
  (e: 'error', message: string): void
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const submitAttempted = ref(false)
const touchedName = ref(false)
const touchedEmail = ref(false)
const touchedPassword = ref(false)
const touchedConfirmation = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const nameValidation = computed(() => (name.value.trim() ? '' : 'Name is required.'))
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

const confirmationValidation = computed(() => {
  if (!passwordConfirmation.value) {
    return 'Please confirm your password.'
  }

  if (passwordConfirmation.value !== password.value) {
    return 'Passwords need to match.'
  }

  return ''
})

const showNameError = computed(() => submitAttempted.value || touchedName.value)
const showEmailError = computed(() => submitAttempted.value || touchedEmail.value)
const showPasswordError = computed(() => submitAttempted.value || touchedPassword.value)
const showConfirmationError = computed(() => submitAttempted.value || touchedConfirmation.value)

const nameError = computed(() => (showNameError.value ? nameValidation.value : ''))
const emailError = computed(() => (showEmailError.value ? emailValidation.value : ''))
const passwordError = computed(() => (showPasswordError.value ? passwordValidation.value : ''))
const confirmationError = computed(() => (
  showConfirmationError.value ? confirmationValidation.value : ''
))

const formValid = computed(
  () =>
    !nameValidation.value &&
    !emailValidation.value &&
    !passwordValidation.value &&
    !confirmationValidation.value
)

const { loading, submit } = useRegisterRequest({
  onSuccess: (user) => {
    emit('success', user)
    submitAttempted.value = false
    touchedName.value = false
    touchedEmail.value = false
    touchedPassword.value = false
    touchedConfirmation.value = false
  },
  onError: (message) => emit('error', message),
})

const register = async () => {
  submitAttempted.value = true

  if (!formValid.value) {
    emit('error', 'Please correct the highlighted fields before continuing.')
    return
  }

  await submit({
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirmation: passwordConfirmation.value,
  })
}
</script>

<template>
  <form class="auth-form" @submit.prevent="register">
    <div class="auth-form__field">
      <label class="auth-form__label" for="register-name">Name</label>
      <InputText
        id="register-name"
        v-model.trim="name"
        type="text"
        autocomplete="name"
        style="width: 100%"
        @blur="touchedName = true"
      />
      <small v-if="nameError" class="p-error">{{ nameError }}</small>
    </div>

    <div class="auth-form__field">
      <label class="auth-form__label" for="register-email">Email</label>
      <InputText
        id="register-email"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        style="width: 100%"
        @blur="touchedEmail = true"
      />
      <small v-if="emailError" class="p-error">{{ emailError }}</small>
    </div>

    <div class="auth-form__field">
      <label class="auth-form__label" for="register-password">Password</label>
      <Password
        id="register-password"
        v-model="password"
        toggleMask
        :feedback="false"
        autocomplete="new-password"
        :input-style="{ width: '100%' }"
        @blur="touchedPassword = true"
      />
      <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
    </div>

    <div class="auth-form__field">
      <label class="auth-form__label" for="register-password-confirm">Confirm password</label>
      <Password
        id="register-password-confirm"
        v-model="passwordConfirmation"
        toggleMask
        :feedback="false"
        autocomplete="new-password"
        :input-style="{ width: '100%' }"
        @blur="touchedConfirmation = true"
      />
      <small v-if="confirmationError" class="p-error">{{ confirmationError }}</small>
    </div>

    <Button
      type="submit"
      label="Create account"
      icon="pi pi-user-plus"
      :loading="loading"
      style="width: 100%"
    />
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
</style>
