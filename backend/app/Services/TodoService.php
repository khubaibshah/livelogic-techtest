<?php

namespace App\Services;

use App\Models\TodoList;
use App\Models\TodoTask;
use App\Repositories\TodoListRepository;
use Illuminate\Contracts\Auth\Authenticatable;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TodoService
{
    private const PRIORITIES = ['high', 'medium', 'low'];

    public function __construct(private readonly TodoListRepository $repository)
    {
    }

    public function lists(Authenticatable $user)
    {
        return $this->repository->getListsForUser($user->getAuthIdentifier());
    }

    public function createList(Authenticatable $user, string $name): TodoList
    {
        return $this->repository->createList($user->getAuthIdentifier(), $name);
    }

    public function deleteList(Authenticatable $user, int $listId): void
    {
        $list = $this->findListOrFail($user, $listId);
        $this->repository->deleteList($list);
    }

    public function addTask(Authenticatable $user, int $listId, string $title, string $priority): TodoTask
    {
        $priority = $this->normalisePriority($priority);

        $list = $this->findListOrFail($user, $listId);

        return $this->repository->createTask($list, $title, $priority);
    }

    public function updateTaskPriority(Authenticatable $user, int $listId, int $taskId, string $priority): TodoTask
    {
        $priority = $this->normalisePriority($priority);

        $task = $this->findTaskOrFail($user, $listId, $taskId);
        $task->priority = $priority;
        $task->save();

        return $task->fresh();
    }

    public function deleteTask(Authenticatable $user, int $listId, int $taskId): void
    {
        $task = $this->findTaskOrFail($user, $listId, $taskId);
        $this->repository->deleteTask($task);
    }

    private function normalisePriority(string $priority): string
    {
        $priority = strtolower($priority);

        if (! in_array($priority, self::PRIORITIES, true)) {
            return 'medium';
        }

        return $priority;
    }

    private function findListOrFail(Authenticatable $user, int $listId): TodoList
    {
        $list = $this->repository->findListForUser($user->getAuthIdentifier(), $listId);

        if (! $list) {
            throw new NotFoundHttpException('List not found.');
        }

        return $list;
    }

    private function findTaskOrFail(Authenticatable $user, int $listId, int $taskId): TodoTask
    {
        $list = $this->findListOrFail($user, $listId);

        $task = $this->repository->findTaskForList($list->id, $taskId);

        if (! $task) {
            throw new NotFoundHttpException('Task not found.');
        }

        return $task;
    }
}
