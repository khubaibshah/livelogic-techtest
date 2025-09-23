<script setup lang="ts">
import { computed, toRefs } from 'vue'
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

const listOptions = computed(() =>
  lists.value.map((list) => ({
    label: list.name,
    value: list.id,
    count: list.tasks.length,
    countLabel: `${list.tasks.length} ${list.tasks.length === 1 ? 'task' : 'tasks'}`,
  }))
)

const selectedOption = computed<number | null>({
  get: () => selectedListId.value ?? null,
  set: (value) => {
    if (typeof value === 'number') {
      emit('select', value)
    }
  },
})

const updateName = (value: string) => {
  emit('update:newListName', value)
}

const submit = () => {
  emit('create')
}
</script>

<template>
  <aside class="todo-sidebar">
    <div class="todo-sidebar__header">
      <h3 class="todo-sidebar__title">Your lists</h3>
      <Tag v-if="listOptions.length" icon="pi pi-folder" :value="`${listOptions.length} lists`" severity="info" />
    </div>

    <form class="todo-sidebar__form" @submit.prevent="submit">
      <label class="todo-sidebar__label" for="todo-create-input">New list</label>
      <InputText
        id="todo-create-input"
        :value="newListName"
        :disabled="creatingList"
        placeholder="e.g. Product launch"
        style="width: 100%"
        @input="updateName(($event.target as HTMLInputElement).value)"
      />
      <div class="todo-sidebar__actions">
        <Button
          type="submit"
          label="Create list"
          icon="pi pi-plus"
          :loading="creatingList"
          :disabled="!canCreateList"
          style="width: 100%"
        />
      </div>
    </form>

    <div v-if="loadingLists" class="todo-sidebar__status">
      <i class="pi pi-spin pi-spinner" aria-hidden="true" />
      <span>Loading lists...</span>
    </div>

    <Message
      v-else-if="listOptions.length === 0"
      severity="info"
      :closable="false"
      text="No lists yet. Create your first one above."
    />

    <Listbox
      v-else
      v-model="selectedOption"
      :options="listOptions"
      optionLabel="label"
      optionValue="value"
      class="todo-sidebar__listbox"
    >
      <template #option="{ option, selected }">
        <div class="todo-sidebar__option" :class="{ 'todo-sidebar__option--selected': selected }">
          <span class="todo-sidebar__name">{{ option.label }}</span>
          <Tag :value="option.countLabel" severity="secondary" />
        </div>
      </template>
    </Listbox>
  </aside>
</template>

<style scoped>
.todo-sidebar {
  display: grid;
  gap: 1.3rem;
}

.todo-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.todo-sidebar__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.todo-sidebar__form {
  display: grid;
  gap: 0.6rem;
}

.todo-sidebar__label {
  font-weight: 600;
  font-size: 0.85rem;
}

.todo-sidebar__actions {
  display: flex;
}

.todo-sidebar__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.todo-sidebar__listbox {
  width: 100%;
}

.todo-sidebar__option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.todo-sidebar__option--selected {
  font-weight: 600;
}

.todo-sidebar__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
