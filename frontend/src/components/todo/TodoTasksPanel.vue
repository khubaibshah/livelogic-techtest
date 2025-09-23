<script setup lang="ts">
import type { Priority, Task, TodoList } from '../../composables/useTodoLists'

const props = defineProps<{
  selectedList: TodoList | null
  sortedTasks: Task[]
  loadingLists: boolean
  newTaskTitle: string
  newTaskPriority: Priority
  addingTask: boolean
  canAddTask: boolean
  deletingTaskId: number | null
  updatingTaskId: number | null
  priorityLabels: Record<Priority, string>
}>()

const emit = defineEmits<{
  (e: 'update:newTaskTitle', value: string): void
  (e: 'update:newTaskPriority', value: Priority): void
  (e: 'add-task'): void
  (e: 'delete-task', taskId: number): void
  (e: 'change-priority', payload: { taskId: number; priority: Priority }): void
}>()

const updateTitle = (event: Event) => {
  emit('update:newTaskTitle', (event.target as HTMLInputElement).value)
}

const updatePriority = (event: Event) => {
  emit('update:newTaskPriority', (event.target as HTMLSelectElement).value as Priority)
}

const submit = () => {
  emit('add-task')
}

const deleteTask = (taskId: number) => {
  emit('delete-task', taskId)
}

const changePriority = (taskId: number, event: Event) => {
  emit('change-priority', { taskId, priority: (event.target as HTMLSelectElement).value as Priority })
}
</script>

<template>
  <section class="todo-tasks">
    <header class="todo-tasks__header">
      <h2 class="todo-tasks__title">
        {{ props.selectedList ? props.selectedList.name : 'No list selected' }}
      </h2>
    </header>

    <div v-if="props.loadingLists" class="todo-tasks__loading">
      <p>Loading tasks...</p>
    </div>

    <div v-else-if="!props.selectedList" class="todo-tasks__empty">
      <p>Create a list to get started.</p>
    </div>

    <div v-else class="todo-tasks__body">
      <form class="todo-tasks__form" @submit.prevent="submit">
        <label class="field">
          <span>Task</span>
          <input
            :value="props.newTaskTitle"
            :disabled="props.addingTask"
            type="text"
            placeholder="e.g. Send report"
            @input="updateTitle"
          />
        </label>

        <label class="field">
          <span>Priority</span>
          <select :value="props.newTaskPriority" :disabled="props.addingTask" @change="updatePriority">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <button class="primary" type="submit" :disabled="props.addingTask || !props.canAddTask">
          {{ props.addingTask ? 'Adding...' : 'Add task' }}
        </button>
      </form>

      <ul class="todo-tasks__list" v-if="props.sortedTasks.length > 0">
        <li
          v-for="task in props.sortedTasks"
          :key="task.id"
          class="todo-tasks__item"
          :data-priority="task.priority"
        >
          <div class="todo-tasks__info">
            <span class="todo-tasks__name">{{ task.title }}</span>
            <span class="todo-tasks__badge">{{ props.priorityLabels[task.priority] }}</span>
          </div>

          <div class="todo-tasks__actions">
            <select
              :value="task.priority"
              class="todo-tasks__priority"
              :disabled="props.updatingTaskId === task.id"
              @change="changePriority(task.id, $event)"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              type="button"
              class="todo-tasks__delete"
              :disabled="props.deletingTaskId === task.id"
              @click="deleteTask(task.id)"
            >
              {{ props.deletingTaskId === task.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="todo-tasks__placeholder">No tasks yet. Add your first task above.</p>
    </div>
  </section>
</template>

<style scoped>
.todo-tasks {
  background: #fff;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 1.5rem;
}

.todo-tasks__title {
  margin: 0;
}

.todo-tasks__loading,
.todo-tasks__empty {
  display: grid;
  place-content: center;
  min-height: 180px;
  border: 1px dashed #cbd5f5;
  border-radius: 12px;
  color: #6b7280;
}

.todo-tasks__body {
  display: grid;
  gap: 1.5rem;
}

.todo-tasks__form {
  display: grid;
  gap: 1rem;
}

.todo-tasks__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.8rem;
}

.todo-tasks__item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.todo-tasks__info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.todo-tasks__name {
  font-weight: 600;
}

.todo-tasks__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  background: #e0e7ff;
  color: #312e81;
}

.todo-tasks__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.todo-tasks__priority {
  border-radius: 6px;
  border: 1px solid #cbd5f5;
  padding: 0.35rem 0.6rem;
}

.todo-tasks__priority:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.todo-tasks__delete {
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 600;
  cursor: pointer;
}

.todo-tasks__delete:hover {
  background: #fecaca;
}

.todo-tasks__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.todo-tasks__placeholder {
  margin: 0;
  text-align: center;
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

.field input,
.field select {
  border-radius: 8px;
  border: 1px solid #cbd5f5;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
}

.field input:focus,
.field select:focus {
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

@media (max-width: 860px) {
  .todo-tasks {
    order: -1;
  }
}
</style>
