<script setup lang="ts">
import { computed, toRefs } from 'vue'
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

const {
  selectedList,
  sortedTasks,
  loadingLists,
  newTaskTitle,
  newTaskPriority,
  addingTask,
  canAddTask,
  deletingTaskId,
  updatingTaskId,
  priorityLabels,
} = toRefs(props)

const emit = defineEmits<{
  (e: 'update:newTaskTitle', value: string): void
  (e: 'update:newTaskPriority', value: Priority): void
  (e: 'add-task'): void
  (e: 'delete-task', taskId: number): void
  (e: 'change-priority', payload: { taskId: number; priority: Priority }): void
}>()

const priorityOptions = computed(() => [
  { label: 'High', value: 'high', severity: 'danger' as const },
  { label: 'Medium', value: 'medium', severity: 'warning' as const },
  { label: 'Low', value: 'low', severity: 'success' as const },
])

const updateTitle = (value: string) => {
  emit('update:newTaskTitle', value)
}

const updatePriority = (value: Priority) => {
  emit('update:newTaskPriority', value)
}

const submit = () => {
  emit('add-task')
}

const deleteTask = (taskId: number) => {
  emit('delete-task', taskId)
}

const changePriority = (taskId: number, priority: Priority) => {
  emit('change-priority', { taskId, priority })
}

const prioritySeverity = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    default:
      return 'success'
  }
}
</script>

<template>
  <section class="todo-tasks">
    <h3 class="todo-tasks__title">{{ selectedList ? selectedList.name : 'Tasks' }}</h3>

    <div v-if="loadingLists" class="todo-tasks__status">
      <i class="pi pi-spin pi-spinner" aria-hidden="true" />
      <span>Loading tasks...</span>
    </div>

    <Message
      v-else-if="!selectedList"
      severity="info"
      :closable="false"
      text="Create or pick a list to get started."
    />

    <div v-else class="todo-tasks__content">
      <form class="todo-tasks__form" @submit.prevent="submit">
        <div class="todo-tasks__fields">
          <div class="todo-tasks__field">
            <label class="todo-tasks__label" for="todo-task-title">Task</label>
            <InputText
              id="todo-task-title"
              :value="newTaskTitle"
              :disabled="addingTask"
              placeholder="e.g. Prepare sprint board"
              style="width: 100%"
              @input="updateTitle(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="todo-tasks__field">
            <label class="todo-tasks__label" for="todo-task-priority">Priority</label>
            <Dropdown
              id="todo-task-priority"
              :model-value="newTaskPriority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              style="width: 100%"
              :disabled="addingTask"
              @update:modelValue="(value) => updatePriority(value as Priority)"
            />
          </div>
        </div>

        <Button
          type="submit"
          label="Add task"
          icon="pi pi-plus"
          :loading="addingTask"
          :disabled="!canAddTask"
        />
      </form>

      <Divider class="todo-tasks__divider" />

      <div v-if="sortedTasks.length > 0" class="todo-tasks__list">
        <div v-for="task in sortedTasks" :key="task.id" class="todo-tasks__item">
          <div class="todo-tasks__info">
            <span class="todo-tasks__name">{{ task.title }}</span>
            <Tag :value="priorityLabels[task.priority]" :severity="prioritySeverity(task.priority)" />
          </div>

          <div class="todo-tasks__actions">
            <Dropdown
              :model-value="task.priority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              class="todo-tasks__priority"
              :disabled="updatingTaskId === task.id"
              @update:modelValue="(value) => changePriority(task.id, value as Priority)"
            />
            <Button
              type="button"
              icon="pi pi-trash"
              severity="danger"
              text
              :loading="deletingTaskId === task.id"
              @click="deleteTask(task.id)"
            />
          </div>
        </div>
      </div>
      <Message v-else severity="secondary" :closable="false" text="No tasks yet. Add your first task above." />
    </div>
  </section>
</template>

<style scoped>
.todo-tasks {
  display: grid;
  gap: 1rem;
}

.todo-tasks__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.todo-tasks__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.todo-tasks__content {
  display: grid;
  gap: 1.4rem;
}

.todo-tasks__form {
  display: grid;
  gap: 0.9rem;
}

.todo-tasks__fields {
  display: grid;
  gap: 0.9rem;
}

.todo-tasks__field {
  display: grid;
  gap: 0.35rem;
}

.todo-tasks__label {
  font-weight: 600;
  font-size: 0.85rem;
}

.todo-tasks__divider {
  margin: 0;
}

.todo-tasks__list {
  display: grid;
  gap: 0.9rem;
}

.todo-tasks__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}

.todo-tasks__item:last-child {
  border-bottom: none;
}

.todo-tasks__info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 200px;
}

.todo-tasks__name {
  font-weight: 600;
}

.todo-tasks__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.todo-tasks__priority {
  min-width: 8rem;
}

@media (min-width: 720px) {
  .todo-tasks__fields {
    grid-template-columns: 1.5fr 1fr;
    align-items: end;
  }
}
</style>

