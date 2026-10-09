<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Un cours est accessible si la formation est publiée et que l'utilisateur y est inscrit.
     */
    public function view(User $user, Course $course): bool
    {
        $formation = $course->module->formation;

        return $formation->is_published && $user->isEnrolledIn($formation);
    }
}
