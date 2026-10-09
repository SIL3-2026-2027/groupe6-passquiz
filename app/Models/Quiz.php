<?php

namespace App\Models;

use Database\Factories\QuizFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['formation_id', 'title', 'description', 'passing_score', 'time_limit_minutes', 'max_attempts', 'retry_delay_minutes', 'requires_course_completion', 'shuffle_questions', 'shuffle_answers', 'is_published'])]
class Quiz extends Model
{
    /** @use HasFactory<QuizFactory> */
    use HasFactory;

    /**
     * Valeurs par défaut : cours terminés exigés, questions et réponses mélangées.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'requires_course_completion' => true,
        'shuffle_questions' => true,
        'shuffle_answers' => true,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'passing_score' => 'integer',
            'time_limit_minutes' => 'integer',
            'max_attempts' => 'integer',
            'retry_delay_minutes' => 'integer',
            'requires_course_completion' => 'boolean',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Formation, $this>
     */
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    /**
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('position');
    }

    /**
     * @return HasMany<QuizAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
