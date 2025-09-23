<script setup lang="ts">
import TodoSidebar from './todo/TodoSidebar.vue'
import TodoTasksPanel from './todo/TodoTasksPanel.vue'
import { priorityLabels, useTodoLists } from '../composables/useTodoLists'
import type { Priority } from '../composables/useTodoLists'

const emit = defineEmits<{
  (e: 'error', message: string): void
}>()

const {
  lists,
  selectedListId,
  selectedList,
  sortedTasks,
  newListName,
  newTaskTitle,
  newTaskPriority,
  loadingLists,
  creatingList,
  addingTask,
  deletingTaskId,
  updatingTaskId,
  canCreateList,
  canAddTask,
  selectList,
  createList,
  addTask,
  deleteTask,
  changePriority,
} = useTodoLists({
  onError: (message) => emit('error', message),
})

const updateListName = (value: string) => {
  newListName.value = value
}

const updateTaskTitle = (value: string) => {
  newTaskTitle.value = value
}

const updateTaskPriority = (value: Priority) => {
  newTaskPriority.value = value
}

const handlePriorityChange = (payload: { taskId: number; priority: Priority }) => {
  changePriority(payload.taskId, payload.priority)
}
</script>

<template>
  <div class="todo">
    <Card class="todo__panel">
      <template #content>
        <TodoSidebar
          :lists="lists"
          :selected-list-id="selectedListId"
          :new-list-name="newListName"
          :creating-list="creatingList"
          :loading-lists="loadingLists"
          :can-create-list="canCreateList"
          @update:newListName="updateListName"
          @create="createList()"
          @select="selectList"
        />
      </template>
    </Card>

    <Card class="todo__panel todo__panel--main">
      <template #content>
        <TodoTasksPanel
          :selected-list="selectedList"
          :sorted-tasks="sortedTasks"
          :loading-lists="loadingLists"
          :new-task-title="newTaskTitle"
          :new-task-priority="newTaskPriority"
          :adding-task="addingTask"
          :can-add-task="canAddTask"
          :deleting-task-id="deletingTaskId"
          :updating-task-id="updatingTaskId"
          :priority-labels="priorityLabels"
          @update:newTaskTitle="updateTaskTitle"
          @update:newTaskPriority="updateTaskPriority"
          @add-task="addTask()"
          @delete-task="deleteTask"
          @change-priority="handlePriorityChange"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.todo {
  display: grid;
  gap: 1.5rem;
}

.todo__panel :deep(.p-card-content) {
  padding-top: 0.5rem;
}

@media (min-width: 960px) {
  .todo {
    grid-template-columns: 320px 1fr;
    align-items: start;
  }
}
</style>
