<script setup lang="ts">
import { useSignOut } from '../composables/useSignOut'

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const { loading, signOut } = useSignOut({
  onSuccess: () => emit('success'),
  onError: (message) => emit('error', message),
})

const handleClick = () => {
  void signOut()
}
</script>

<template>
  <button class="secondary" type="button" :disabled="loading" @click="handleClick">
    {{ loading ? 'Signing out...' : 'Sign out' }}
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
