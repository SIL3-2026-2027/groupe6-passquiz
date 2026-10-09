<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FormationLearnerController extends Controller
{
    /**
     * Apprenants inscrits à une formation, avec leur nombre de cours terminés.
     */
    public function __invoke(Request $request, Formation $formation): AnonymousResourceCollection
    {
        $courseIds = $formation->courses()->pluck('courses.id');

        $learners = $formation->learners()
            ->withCount(['completedCourses as completed_courses_count' => fn (Builder $courses) => $courses->whereIn('courses.id', $courseIds)])
            ->orderByPivot('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return UserResource::collection($learners)->additional([
            'meta' => ['total_courses' => $courseIds->count()],
        ]);
    }
}
