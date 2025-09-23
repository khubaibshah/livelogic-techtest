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
  <Button
    type="button"
    label="Sign out"
    icon="pi pi-sign-out"
    severity="secondary"
    :loading="loading"
    @click="handleClick"
  />
</template>
