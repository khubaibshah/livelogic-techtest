<script setup lang="ts">
import { toRefs } from 'vue'
import type { TodoList } from '../../composables/useTodoLists'

const props = defineProps<{
  lists: TodoList[]
  selectedListId: number | null
  newListName: string
  creatingList: boolean
  loadingLists: boolean
  canCreateList: boolean
}>()

const { lists, selectedListId, newListName, creatingList, loadingLists, canCreateList } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:newListName', value: string): void
  (e: 'create'): void
  (e: 'select', value: number): void
}>()

const updateName = (event: Event) => {
  emit('update:newListName', (event.target as HTMLInputElement).value)
}

const submit = () => {
  emit('create')
}

const selectList = (listId: number) => {
  emit('select', listId)
}
</script>

<template>
  <aside class="todo-sidebar">
    <h2 class="todo-sidebar__title">Lists</h2>

    <form class="todo-sidebar__form" @submit.prevent="submit">
      <label class="field">
        <span>New list</span>
        <input :value="newListName" :disabled="creatingList" type="text" placeholder="e.g. Work" @input="updateName" />
      </label>
      <button class="primary" type="submit" :disabled="creatingList || !canCreateList">
        {{ creatingList ? 'Creating...' : 'Create list' }}
      </button>
    </form>

    <p v-if="loadingLists" class="todo-sidebar__status">Loading lists...</p>
    <p v-else-if="lists.length === 0" class="todo-sidebar__status">No lists yet. Create one above.</p>

    <ul class="todo-sidebar__lists" v-else>
      <li
        v-for="list in lists"
        :key="list.id"
        :class="['todo-sidebar__item', { 'todo-sidebar__item--active': list.id === selectedListId }]"
      >
        <button type="button" class="todo-sidebar__button" @click="selectList(list.id)">
          <span class="todo-sidebar__name">{{ list.name }}</span>
          <span class="todo-sidebar__count">{{ list.tasks.length }} tasks</span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.todo-sidebar {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.todo-sidebar__title {
  margin: 0;
  font-size: 1.2rem;
}

.todo-sidebar__form {
  display: grid;
  gap: 0.9rem;
}

.todo-sidebar__status {
  margin: 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.todo-sidebar__lists {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.todo-sidebar__item {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.todo-sidebar__item--active {
  outline: 2px solid #4f46e5;
}

.todo-sidebar__button {
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  cursor: pointer;
}

.todo-sidebar__name {
  font-weight: 600;
}

.todo-sidebar__count {
  font-size: 0.85rem;
  color: #6b7280;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  font-size: 0.85rem;
  font-weight: 600;
}

.field input {
  border-radius: 8px;
  border: 1px solid #cbd5f5;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
}

.field input:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 1px;
}

.primary {
  height: 2.6rem;
  border-radius: 8px;
  border: none;
  background: #4f46e5;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
