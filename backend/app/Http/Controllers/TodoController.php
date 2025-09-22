<?php

namespace App\Http\Controllers;

use App\Services\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function __construct(private readonly TodoService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $lists = $this->service->lists($request->user());

        return response()->json([
            'data' => $lists,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $list = $this->service->createList($request->user(), $payload['name']);

        return response()->json([
            'message' => 'List created.',
            'data' => $list,
        ], 201);
    }

    public function destroy(Request $request, int $listId): JsonResponse
    {
        $this->service->deleteList($request->user(), $listId);

        return response()->json([
            'message' => 'List deleted.',
        ]);
    }

    public function storeTask(Request $request, int $listId): JsonResponse
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'priority' => ['sometimes', 'in:high,medium,low'],
        ]);

        $task = $this->service->addTask(
            $request->user(),
            $listId,
            $payload['title'],
            $payload['priority'] ?? 'medium'
        );

        return response()->json([
            'message' => 'Task created.',
            'data' => $task,
        ], 201);
    }

    public function updateTask(Request $request, int $listId, int $taskId): JsonResponse
    {
        $payload = $request->validate([
            'priority' => ['required', 'in:high,medium,low'],
        ]);

        $task = $this->service->updateTaskPriority(
            $request->user(),
            $listId,
            $taskId,
            $payload['priority']
        );

        return response()->json([
            'message' => 'Task updated.',
            'data' => $task,
        ]);
    }

    public function destroyTask(Request $request, int $listId, int $taskId): JsonResponse
    {
        $this->service->deleteTask($request->user(), $listId, $taskId);

        return response()->json([
            'message' => 'Task deleted.',
        ]);
    }
}
