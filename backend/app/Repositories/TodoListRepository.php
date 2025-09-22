<?php

namespace App\Repositories;

use App\Models\TodoList;
use App\Models\TodoTask;
use Illuminate\Database\Eloquent\Collection;

class TodoListRepository
{
    public function getListsForUser(int $userId): Collection
    {
        return TodoList::with('tasks')
            ->where('user_id', $userId)
            ->orderBy('created_at')
            ->get();
    }

    public function createList(int $userId, string $name): TodoList
    {
        $list = TodoList::create([
            'user_id' => $userId,
            'name' => $name,
        ]);

        return $list->fresh(['tasks']);
    }

    public function deleteList(TodoList $list): void
    {
        $list->delete();
    }

    public function findListForUser(int $userId, int $listId): ?TodoList
    {
        return TodoList::with('tasks')
            ->where('user_id', $userId)
            ->where('id', $listId)
            ->first();
    }

    public function createTask(TodoList $list, string $title, string $priority): TodoTask
    {
        $task = $list->tasks()->create([
            'title' => $title,
            'priority' => $priority,
        ]);

        return $task->fresh();
    }

    public function findTaskForList(int $listId, int $taskId): ?TodoTask
    {
        return TodoTask::where('todo_list_id', $listId)
            ->where('id', $taskId)
            ->first();
    }

    public function deleteTask(TodoTask $task): void
    {
        $task->delete();
    }
}
