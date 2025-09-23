import { computed, onMounted, ref, watch } from 'vue'

export type Priority = 'high' | 'medium' | 'low'

export type Task = {
  id: number
  title: string
  priority: Priority
  createdAt: number
}

export type TodoList = {
  id: number
  name: string
  tasks: Task[]
  createdAt: number
}

export const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

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

type RequestOptions = {
  requireCsrf?: boolean
}

type UseTodoListsOptions = {
  onError?: (message: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const useTodoLists = (options: UseTodoListsOptions = {}) => {
  const emitError = (message: string) => {
    options.onError?.(message)
  }

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

  const selectedList = computed(() => lists.value.find((list) => list.id === selectedListId.value) ?? null)

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

  const request = async <T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T | null> => {
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

      emitError('')
    } catch (error) {
      lists.value = []
      selectedListId.value = null
      emitError(error instanceof Error ? error.message : 'Failed to load to-do lists.')
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
        emitError('')
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Unable to create list.')
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
        `/api/todos/${list.id}/tasks`,
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
        emitError('')
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Unable to add task.')
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
      await request(`/api/todos/${list.id}/tasks/${taskId}`, { method: 'DELETE' }, { requireCsrf: true })

      list.tasks = list.tasks.filter((task) => task.id !== taskId)
      emitError('')
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Unable to delete task.')
    } finally {
      deletingTaskId.value = null
    }
  }

  const changePriority = async (taskId: number, nextPriority: Priority) => {
    const list = selectedList.value

    if (!list || updatingTaskId.value !== null) {
      return
    }

    const task = list.tasks.find((entry) => entry.id === taskId)

    if (!task || task.priority === nextPriority) {
      return
    }

    const previousPriority = task.priority
    updatingTaskId.value = taskId

    try {
      const response = await request<{ data: ApiTask }>(
        `/api/todos/${list.id}/tasks/${taskId}`,
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
        emitError('')
      }
    } catch (error) {
      task.priority = previousPriority
      emitError(error instanceof Error ? error.message : 'Unable to update task.')
    } finally {
      updatingTaskId.value = null
    }
  }

  const canCreateList = computed(() => newListName.value.trim().length > 0)
  const canAddTask = computed(() => selectedList.value !== null && newTaskTitle.value.trim().length > 0)

  onMounted(loadLists)

  return {
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
    loadLists,
  }
}
