<?php

namespace Tests\Feature;

use App\Models\TodoList;
use App\Models\TodoTask;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TodoEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_endpoint_returns_current_user(): void
    {
        $user = $this->actingAsUser();

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJson([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);
    }

    public function test_can_list_todos_for_authenticated_user(): void
    {
        $user = $this->actingAsUser();
        $lists = TodoList::factory()->count(2)->create(['user_id' => $user->id]);
        TodoTask::factory()->create([
            'todo_list_id' => $lists[0]->id,
            'priority' => 'high',
        ]);
        TodoTask::factory()->create([
            'todo_list_id' => $lists[0]->id,
            'priority' => 'low',
        ]);

        $this->getJson('/api/todos')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => $lists[0]->name])
            ->assertJsonFragment(['name' => $lists[1]->name]);
    }

    public function test_can_create_todo_list(): void
    {
        $user = $this->actingAsUser();

        $this->postJson('/api/todos', ['name' => 'Work Projects'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Work Projects');

        $this->assertDatabaseHas('todo_lists', [
            'user_id' => $user->id,
            'name' => 'Work Projects',
        ]);
    }

    public function test_create_list_requires_name(): void
    {
        $this->actingAsUser();

        $this->postJson('/api/todos', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_can_delete_own_list(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/todos/{$list->id}")
            ->assertOk()
            ->assertJson(['message' => 'List deleted.']);

        $this->assertDatabaseMissing('todo_lists', ['id' => $list->id]);
    }

    public function test_can_add_task_to_list(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);

        $this->postJson("/api/todos/{$list->id}/tasks", [
            'title' => 'Send report',
            'priority' => 'high',
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Send report')
            ->assertJsonPath('data.priority', 'high');

        $this->assertDatabaseHas('todo_tasks', [
            'todo_list_id' => $list->id,
            'title' => 'Send report',
            'priority' => 'high',
        ]);
    }

    public function test_task_creation_defaults_priority_to_medium(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);

        $this->postJson("/api/todos/{$list->id}/tasks", [
            'title' => 'Review pull requests',
        ])
            ->assertCreated()
            ->assertJsonPath('data.priority', 'medium');
    }

    public function test_can_update_task_priority(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);
        $task = TodoTask::factory()->create([
            'todo_list_id' => $list->id,
            'priority' => 'low',
        ]);

        $this->patchJson("/api/todos/{$list->id}/tasks/{$task->id}", [
            'priority' => 'high',
        ])
            ->assertOk()
            ->assertJsonPath('data.priority', 'high');

        $this->assertDatabaseHas('todo_tasks', [
            'id' => $task->id,
            'priority' => 'high',
        ]);
    }

    public function test_update_task_requires_valid_priority(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);
        $task = TodoTask::factory()->create([
            'todo_list_id' => $list->id,
        ]);

        $this->patchJson("/api/todos/{$list->id}/tasks/{$task->id}", [
            'priority' => 'urgent',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_can_delete_task(): void
    {
        $user = $this->actingAsUser();
        $list = TodoList::factory()->create(['user_id' => $user->id]);
        $task = TodoTask::factory()->create(['todo_list_id' => $list->id]);

        $this->deleteJson("/api/todos/{$list->id}/tasks/{$task->id}")
            ->assertOk()
            ->assertJson(['message' => 'Task deleted.']);

        $this->assertDatabaseMissing('todo_tasks', ['id' => $task->id]);
    }

    private function actingAsUser(?User $user = null): User
    {
        $user = $user ?? User::factory()->create();

        Sanctum::actingAs($user);

        return $user;
    }
}
