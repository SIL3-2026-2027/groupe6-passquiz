<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isTrainer(): bool
    {
        return $this->role === UserRole::Trainer;
    }

    /**
     * Administrateurs et formateurs accèdent à l'espace de gestion du contenu.
     */
    public function isStaff(): bool
    {
        return $this->isAdmin() || $this->isTrainer();
    }

    /**
     * @return HasMany<Enrollment, $this>
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * @return BelongsToMany<Formation, $this>
     */
    public function formations(): BelongsToMany
    {
        return $this->belongsToMany(Formation::class, 'enrollments')
            ->withPivot('completed_at')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<Course, $this>
     */
    public function completedCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_progress')
            ->withPivot('completed_at')
            ->withTimestamps();
    }

    /**
     * @return HasMany<QuizAttempt, $this>
     */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function isEnrolledIn(Formation $formation): bool
    {
        return $this->enrollments()->where('formation_id', $formation->id)->exists();
    }
}
