<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TodoTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'todo_list_id',
        'title',
        'priority',
    ];

    protected $casts = [
        'todo_list_id' => 'integer',
    ];

    public function todoList(): BelongsTo
    {
        return $this->belongsTo(TodoList::class, 'todo_list_id');
    }
}
