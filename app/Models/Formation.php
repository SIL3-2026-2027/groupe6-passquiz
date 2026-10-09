<?php

namespace App\Models;

use App\Enums\FormationLevel;
use Database\Factories\FormationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['title', 'slug', 'code', 'description', 'image_path', 'level', 'is_published'])]
class Formation extends Model
{
    /** @use HasFactory<FormationFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => FormationLevel::class,
            'is_published' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Module, $this>
     */
    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('number');
    }

    /**
     * @return HasManyThrough<Course, Module, $this>
     */
    public function courses(): HasManyThrough
    {
        return $this->hasManyThrough(Course::class, Module::class);
    }

    /**
     * @return HasOne<Quiz, $this>
     */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class);
    }

    /**
     * @return HasManyThrough<QuizAttempt, Quiz, $this>
     */
    public function attempts(): HasManyThrough
    {
        return $this->hasManyThrough(QuizAttempt::class, Quiz::class);
    }

    /**
     * @return HasMany<Enrollment, $this>
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function learners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('completed_at')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * @param  Builder<Formation>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * Ajoute `courses_count` et `completed_courses_count` pour l'utilisateur donné.
     *
     * @param  Builder<Formation>  $query
     */
    #[Scope]
    protected function withProgressFor(Builder $query, User $user): void
    {
        $query->withCount([
            'courses',
            'courses as completed_courses_count' => fn (Builder $courses) => $courses
                ->whereHas('completedBy', fn (Builder $users) => $users->whereKey($user->id)),
        ]);
    }

    /**
     * Pourcentage de progression, à partir des compteurs chargés par `withProgressFor`.
     */
    public function progressPercent(): int
    {
        $total = (int) $this->courses_count;

        if ($total === 0) {
            return 0;
        }

        return (int) round(((int) $this->completed_courses_count / $total) * 100);
    }
}
