<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Module;
use App\Models\User;
use App\Notifications\CourseCompleted;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Notification;

class ProgressService
{
    /**
     * Marque le cours comme terminé, prévient l'équipe la première fois
     * et clôture l'inscription lorsque tous les cours sont terminés.
     */
    public function completeCourse(User $user, Course $course): void
    {
        $changes = $user->completedCourses()->syncWithoutDetaching([
            $course->id => ['completed_at' => now()],
        ]);

        if ($changes['attached'] !== []) {
            Notification::send($this->courseCompletionRecipients($course, $user), new CourseCompleted($user, $course));
        }

        $formation = $course->module->formation;

        $enrollment = Enrollment::query()
            ->whereBelongsTo($user)
            ->whereBelongsTo($formation)
            ->whereNull('completed_at')
            ->first();

        if ($enrollment !== null && $this->summary($user, $formation)['percent'] === 100) {
            $enrollment->update(['completed_at' => now()]);
        }
    }

    /**
     * Administrateurs actifs et formateur de la formation, sans l'apprenant lui-même.
     *
     * @return Collection<int, User>
     */
    private function courseCompletionRecipients(Course $course, User $learner): Collection
    {
        $trainerId = $course->module->formation->trainer_id;

        return User::query()
            ->where('is_active', true)
            ->where(fn (Builder $users) => $users
                ->where('role', UserRole::Admin)
                ->when($trainerId, fn (Builder $users) => $users->orWhereKey($trainerId)))
            ->whereKeyNot($learner->id)
            ->get();
    }

    /**
     * Tous les cours du module sont terminés par l'apprenant.
     */
    public function hasCompletedModule(User $user, Module $module): bool
    {
        return $module->courses()
            ->whereDoesntHave('completedBy', fn (Builder $users) => $users->whereKey($user->id))
            ->doesntExist();
    }

    /**
     * @return array{total_courses: int, completed_courses: int, percent: int}
     */
    public function moduleSummary(User $user, Module $module): array
    {
        $total = $module->courses()->count();
        $completed = $module->courses()->whereHas('completedBy', fn (Builder $users) => $users->whereKey($user->id))->count();

        return [
            'total_courses' => $total,
            'completed_courses' => $completed,
            'percent' => $total > 0 ? (int) round($completed / $total * 100) : 0,
        ];
    }

    /**
     * Modules non encore validés : leur quiz publié n'a pas été réussi par l'apprenant.
     * Un module sans quiz publié n'a rien à valider.
     *
     * @return Collection<int, Module>
     */
    public function modulesToValidate(User $user, Formation $formation): Collection
    {
        return $formation->modules()
            ->whereHas('quiz', fn (Builder $quizzes) => $quizzes
                ->where('is_published', true)
                ->whereDoesntHave('attempts', fn (Builder $attempts) => $attempts->whereBelongsTo($user)->where('passed', true)))
            ->get();
    }

    /**
     * @return array{total_courses: int, completed_courses: int, percent: int}
     */
    public function summary(User $user, Formation $formation): array
    {
        $formation = Formation::query()->withProgressFor($user)->findOrFail($formation->id);

        return [
            'total_courses' => (int) $formation->courses_count,
            'completed_courses' => (int) $formation->completed_courses_count,
            'percent' => $formation->progressPercent(),
        ];
    }
}
