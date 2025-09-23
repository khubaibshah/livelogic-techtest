<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', app: 'todo' | 'poll'): void
}>()

const choose = (app: 'todo' | 'poll') => {
  emit('select', app)
}
</script>

<template>
  <section class="menu">
    <div class="menu__header">
      <h3 class="menu__title">Choose a workspace</h3>
      <p class="menu__subtitle">Pick a mini app to continue.</p>
    </div>
    <div class="menu__actions">
      <Button
        type="button"
        label="To-Do List"
        icon="pi pi-list-check"
        size="large"
        class="menu__button"
        @click="choose('todo')"
      />
      <Button
        type="button"
        label="Polls"
        icon="pi pi-chart-bar"
        size="large"
        severity="info"
        class="menu__button"
        @click="choose('poll')"
      />
    </div>
  </section>
</template>

<style scoped>
.menu {
  display: grid;
  gap: 1.5rem;
}

.menu__title {
  margin: 0;
  font-size: 1.25rem;
}

.menu__subtitle {
  margin: 0.2rem 0 0;
  color: #6b7280;
}

.menu__actions {
  display: grid;
  gap: 1rem;
}

.menu__button {
  width: 100%;
}
</style>
