import { ref } from 'vue'

import { sanctumRequest } from './useSanctumClient'

type ApiUser = {
  name: string
  email: string
}

type LoginPayload = {
  email: string
  password: string
  remember: boolean
}

type RegisterPayload = {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

type UseLoginOptions = {
  onSuccess?: (user: ApiUser) => void
  onError?: (message: string) => void
}

type UseRegisterOptions = {
  onSuccess?: (user: ApiUser) => void
  onError?: (message: string) => void
}

export const useLoginRequest = (options: UseLoginOptions = {}) => {
  const loading = ref(false)

  const submit = async (payload: LoginPayload) => {
    if (loading.value) {
      return
    }

    loading.value = true
    options.onError?.('')

    try {
      const response = await sanctumRequest<{ user: ApiUser }>(
        '/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: payload.email.trim(),
            password: payload.password,
            remember: payload.remember,
          }),
        },
        { requireCsrf: true }
      )

      const user = response?.user

      if (!user) {
        throw new Error('Login failed.')
      }

      options.onSuccess?.(user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      options.onError?.(message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    submit,
  }
}

export const useRegisterRequest = (options: UseRegisterOptions = {}) => {
  const loading = ref(false)

  const submit = async (payload: RegisterPayload) => {
    if (loading.value) {
      return
    }

    loading.value = true
    options.onError?.('')

    try {
      const response = await sanctumRequest<{ user: ApiUser }>(
        '/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name: payload.name.trim(),
            email: payload.email.trim(),
            password: payload.password,
            password_confirmation: payload.passwordConfirmation,
          }),
        },
        { requireCsrf: true }
      )

      const user = response?.user

      if (!user) {
        throw new Error('Registration failed.')
      }

      options.onSuccess?.(user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      options.onError?.(message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    submit,
  }
}
