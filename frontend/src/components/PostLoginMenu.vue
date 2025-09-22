<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', app: 'todo' | 'poll'): void
}>()

const choose = (app: 'todo' | 'poll') => {
  emit('select', app)
}
</script>

<template>
  <div class="menu">
    <h2 class="menu__title">Choose a mini app</h2>
    <div class="menu__options">
      <button type="button" class="menu__option" @click="choose('todo')">
        To-Do List
      </button>
      <button type="button" class="menu__option" @click="choose('poll')">
        Poll
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  display: grid;
  gap: 1.5rem;
  text-align: center;
}

.menu__title {
  margin: 0;
}

.menu__options {
  display: grid;
  gap: 1rem;
}

.menu__option {
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #4f46e5;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.menu__option:focus {
  outline: 2px solid #312e81;
  outline-offset: 2px;
}

.menu__option:hover {
  background: #4338ca;
}
</style>
