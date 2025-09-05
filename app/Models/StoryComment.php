<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryComment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'story_id',
        'user_id',
        'content',
    ];

    // Relaciones

    /**
     * Story que recibió el comentario
     */
    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    /**
     * Usuario que escribió el comentario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
