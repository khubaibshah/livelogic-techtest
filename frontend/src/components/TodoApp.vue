<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type Priority = 'high' | 'medium' | 'low'

type ApiTask = {
  id: number
  title: string
  priority: Priority
  created_at?: string
  updated_at?: string
}

type ApiList = {
  id: number
  name: string
  tasks?: ApiTask[]
  created_at?: string
  updated_at?: string
}

type Task = {
  id: number
  title: string
  priority: Priority
  createdAt: number
}

type TodoList = {
  id: number
  name: string
  tasks: Task[]
  createdAt: number
}

const emit = defineEmits<{
  (e: 'error', message: string): void
}>()

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const lists = ref<TodoList[]>([])
const selectedListId = ref<number | null>(null)

const loadingLists = ref(true)
const creatingList = ref(false)
const addingTask = ref(false)
const deletingTaskId = ref<number | null>(null)
const updatingTaskId = ref<number | null>(null)

const newListName = ref('')
const newTaskTitle = ref('')
const newTaskPriority = ref<Priority>('medium')

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const selectedList = computed(() => lists.value.find((list) => list.id === selectedListId.value) ?? null)

watch(
  lists,
  (next) => {
    if (!selectedListId.value && next.length > 0) {
      selectedListId.value = next[0]?.id ?? null
    }

    if (selectedListId.value && !next.some((list) => list.id === selectedListId.value)) {
      selectedListId.value = next[0]?.id ?? null
    }
  },
  { deep: true }
)

const sortedTasks = computed(() => {
  const list = selectedList.value

  if (!list) {
    return [] as Task[]
  }

  return [...list.tasks].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

    if (priorityDiff !== 0) {
      return priorityDiff
    }

    return a.createdAt - b.createdAt
  })
})

const findCookieValue = (key: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(key + '='))

  return match ? decodeURIComponent(match.split('=')[1]) : null
}

const getXsrfToken = (): string | null => findCookieValue('XSRF-TOKEN')

const ensureCsrfCookie = async () => {
  await fetch(API_BASE_URL + '/sanctum/csrf-cookie', {
    credentials: 'include',
  })
}

const extractErrorMessage = (problem: unknown): string => {
  if (problem && typeof problem === 'object') {
    const candidate = problem as { message?: unknown; errors?: Record<string, unknown> }

    if (candidate.errors && typeof candidate.errors === 'object') {
      for (const value of Object.values(candidate.errors)) {
        if (Array.isArray(value)) {
          const found = value.find((entry) => typeof entry === 'string')
          if (found) {
            return found
          }
        } else if (typeof value === 'string') {
          return value
        }
      }
    }

    if (typeof candidate.message === 'string') {
      return candidate.message
    }
  }

  return 'Something went wrong.'
}

const request = async <T>(
  path: string,
  init: RequestInit = {},
  options: { requireCsrf?: boolean } = {}
): Promise<T | null> => {
  const requiresCsrf = options.requireCsrf ?? false
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (requiresCsrf) {
    await ensureCsrfCookie()
    const token = getXsrfToken()

    if (!token) {
      throw new Error('Unable to establish CSRF token.')
    }

    headers['X-XSRF-TOKEN'] = token
  }

  if (init.body && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(API_BASE_URL + path, {
      credentials: 'include',
      ...init,
      headers,
    })

    const text = await response.text()

    if (!response.ok) {
      let problem: unknown = null

      if (text) {
        try {
          problem = JSON.parse(text)
        } catch {
          problem = null
        }
      }

      throw new Error(problem ? extractErrorMessage(problem) : 'Request failed.')
    }

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text) as T
    } catch {
      return null
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Something went wrong.')
  }
}

const parseTimestamp = (value?: string): number => {
  if (!value) {
    return Date.now()
  }

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

const mapTask = (task: ApiTask): Task => ({
  id: task.id,
  title: task.title,
  priority: task.priority,
  createdAt: parseTimestamp(task.created_at),
})

const mapList = (list: ApiList): TodoList => ({
  id: list.id,
  name: list.name,
  createdAt: parseTimestamp(list.created_at),
  tasks: (list.tasks ?? []).map(mapTask),
})

const selectList = (listId: number) => {
  selectedListId.value = listId
  newTaskTitle.value = ''
  newTaskPriority.value = 'medium'
}

const loadLists = async () => {
  loadingLists.value = true

  try {
    const response = await request<{ data: ApiList[] }>('/api/todos')
    const apiLists = response?.data ?? []
    const mapped = apiLists.map(mapList)

    const previousId = selectedListId.value

    lists.value = mapped

    if (mapped.length === 0) {
      selectedListId.value = null
    } else if (previousId && mapped.some((list) => list.id === previousId)) {
      selectedListId.value = previousId
    } else {
      selectedListId.value = mapped[0]?.id ?? null
    }

    emit('error', '')
  } catch (error) {
    lists.value = []
    selectedListId.value = null

    emit('error', error instanceof Error ? error.message : 'Failed to load to-do lists.')
  } finally {
    loadingLists.value = false
  }
}

const createList = async () => {
  const trimmedName = newListName.value.trim()

  if (!trimmedName || creatingList.value) {
    return
  }

  creatingList.value = true

  try {
    const response = await request<{ data: ApiList }>(
      '/api/todos',
      {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName }),
      },
      { requireCsrf: true }
    )

    const apiList = response?.data

    if (apiList) {
      const list = mapList(apiList)
      lists.value.push(list)
      selectedListId.value = list.id
      newListName.value = ''
      emit('error', '')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Unable to create list.')
  } finally {
    creatingList.value = false
  }
}

const addTask = async () => {
  const list = selectedList.value
  const trimmedTitle = newTaskTitle.value.trim()

  if (!list || !trimmedTitle || addingTask.value) {
    return
  }

  addingTask.value = true

  try {
    const response = await request<{ data: ApiTask }>(
      '/api/todos/' + list.id + '/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          title: trimmedTitle,
          priority: newTaskPriority.value,
        }),
      },
      { requireCsrf: true }
    )

    const apiTask = response?.data

    if (apiTask) {
      const task = mapTask(apiTask)
      list.tasks.push(task)
      newTaskTitle.value = ''
      newTaskPriority.value = 'medium'
      emit('error', '')
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Unable to add task.')
  } finally {
    addingTask.value = false
  }
}

const deleteTask = async (taskId: number) => {
  const list = selectedList.value

  if (!list || deletingTaskId.value !== null) {
    return
  }

  deletingTaskId.value = taskId

  try {
    await request('/api/todos/' + list.id + '/tasks/' + taskId, { method: 'DELETE' }, { requireCsrf: true })

    list.tasks = list.tasks.filter((task) => task.id !== taskId)
    emit('error', '')
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Unable to delete task.')
  } finally {
    deletingTaskId.value = null
  }
}

const changePriority = async (taskId: number, event: Event) => {
  const list = selectedList.value

  if (!list || updatingTaskId.value !== null) {
    return
  }

  const target = event.target as HTMLSelectElement
  const nextPriority = target.value as Priority
  const task = list.tasks.find((entry) => entry.id === taskId)

  if (!task || task.priority === nextPriority) {
    return
  }

  const previousPriority = task.priority
  updatingTaskId.value = taskId

  try {
    const response = await request<{ data: ApiTask }>(
      '/api/todos/' + list.id + '/tasks/' + taskId,
      {
        method: 'PATCH',
        body: JSON.stringify({ priority: nextPriority }),
      },
      { requireCsrf: true }
    )

    const apiTask = response?.data

    if (apiTask) {
      const mappedTask = mapTask(apiTask)
      task.priority = mappedTask.priority
      task.createdAt = mappedTask.createdAt
      emit('error', '')
    }
  } catch (error) {
    target.value = previousPriority
    emit('error', error instanceof Error ? error.message : 'Unable to update task.')
  } finally {
    updatingTaskId.value = null
  }
}

const canCreateList = computed(() => newListName.value.trim().length > 0)
const canAddTask = computed(() => selectedList.value !== null && newTaskTitle.value.trim().length > 0)

onMounted(loadLists)
</script>

<template>
  <div class="todo">
    <section class="sidebar">
      <h2 class="sidebar__title">Lists</h2>

      <form class="sidebar__form" @submit.prevent="createList">
        <label class="field">
          <span>New list</span>
          <input v-model="newListName" :disabled="creatingList" type="text" placeholder="e.g. Work" />
        </label>
        <button class="primary" type="submit" :disabled="creatingList || !canCreateList">
          {{ creatingList ? 'Creating...' : 'Create list' }}
        </button>
      </form>

      <p v-if="loadingLists" class="sidebar__status">Loading lists...</p>
      <p v-else-if="lists.length === 0" class="sidebar__status">No lists yet. Create one above.</p>

      <ul class="sidebar__lists" v-else>
        <li
          v-for="list in lists"
          :key="list.id"
          :class="['sidebar__item', { 'sidebar__item--active': list.id === selectedListId }]"
        >
          <button type="button" class="sidebar__button" @click="selectList(list.id)">
            <span class="sidebar__name">{{ list.name }}</span>
            <span class="sidebar__count">{{ list.tasks.length }} tasks</span>
          </button>
        </li>
      </ul>
    </section>

    <section class="tasks">
      <header class="tasks__header">
        <h2 class="tasks__title">
          {{ selectedList ? selectedList.name : 'No list selected' }}
        </h2>
      </header>

      <div v-if="loadingLists" class="tasks__loading">
        <p>Loading tasks...</p>
      </div>

      <div v-else-if="!selectedList" class="tasks__empty">
        <p>Create a list to get started.</p>
      </div>

      <div v-else class="tasks__body">
        <form class="tasks__form" @submit.prevent="addTask">
          <label class="field">
            <span>Task</span>
            <input v-model="newTaskTitle" :disabled="addingTask" type="text" placeholder="e.g. Send report" />
          </label>

          <label class="field">
            <span>Priority</span>
            <select v-model="newTaskPriority" :disabled="addingTask">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <button class="primary" type="submit" :disabled="addingTask || !canAddTask">
            {{ addingTask ? 'Adding...' : 'Add task' }}
          </button>
        </form>

        <ul class="tasks__list" v-if="sortedTasks.length > 0">
          <li v-for="task in sortedTasks" :key="task.id" class="tasks__item" :data-priority="task.priority">
            <div class="tasks__info">
              <span class="tasks__title">{{ task.title }}</span>
              <span class="tasks__badge">{{ priorityLabels[task.priority] }}</span>
            </div>

            <div class="tasks__actions">
              <select
                :value="task.priority"
                class="tasks__priority"
                :disabled="updatingTaskId === task.id"
                @change="changePriority(task.id, $event)"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                type="button"
                class="tasks__delete"
                :disabled="deletingTaskId === task.id"
                @click="deleteTask(task.id)"
              >
                {{ deletingTaskId === task.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="tasks__placeholder">No tasks yet. Add your first task above.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.todo {
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr;
  gap: 2rem;
  min-height: 320px;
}

.sidebar {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.sidebar__title {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar__form {
  display: grid;
  gap: 0.9rem;
}

.sidebar__status {
  margin: 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.sidebar__lists {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.sidebar__item {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.sidebar__item--active {
  outline: 2px solid #4f46e5;
}

.sidebar__button {
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

.sidebar__button:disabled {
  cursor: not-allowed;
}

.sidebar__name {
  font-weight: 600;
}

.sidebar__count {
  font-size: 0.85rem;
  color: #6b7280;
}

.tasks {
  background: #fff;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 1.5rem;
}

.tasks__title {
  margin: 0;
}

.tasks__loading,
.tasks__empty {
  color: #6b7280;
}

.tasks__form {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  align-items: end;
}

.tasks__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.8rem;
}

.tasks__item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tasks__info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tasks__title {
  font-weight: 600;
}

.tasks__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  background: #e0e7ff;
  color: #312e81;
}

.tasks__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.tasks__priority {
  border-radius: 6px;
  border: 1px solid #cbd5f5;
  padding: 0.35rem 0.6rem;
}

.tasks__priority:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tasks__delete {
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 600;
  cursor: pointer;
}

.tasks__delete:hover {
  background: #fecaca;
}

.tasks__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tasks__placeholder {
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
  .todo {
    grid-template-columns: 1fr;
  }

  .tasks {
    order: -1;
  }
}
</style>
