<?php

namespace Database\Factories;

use App\Models\TodoList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TodoList>
 */
class TodoListFactory extends Factory
{
    protected $model = TodoList::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->sentence(3),
        ];
    }
}
