<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\User;

class ProgressService
{
    /**
     * Marque le cours comme terminé et clôture l'inscription lorsque tous les cours sont terminés.
     */
    public function completeCourse(User $user, Course $course): void
    {
        $user->completedCourses()->syncWithoutDetaching([
            $course->id => ['completed_at' => now()],
        ]);

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
