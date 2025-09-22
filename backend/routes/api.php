<?php

use App\Http\Controllers\TodoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::delete('/todos/{listId}', [TodoController::class, 'destroy']);

    Route::post('/todos/{listId}/tasks', [TodoController::class, 'storeTask']);
    Route::patch('/todos/{listId}/tasks/{taskId}', [TodoController::class, 'updateTask']);
    Route::delete('/todos/{listId}/tasks/{taskId}', [TodoController::class, 'destroyTask']);
});
