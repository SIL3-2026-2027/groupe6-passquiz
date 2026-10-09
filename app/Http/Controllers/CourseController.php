<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    public function __construct(private ProgressService $progress) {}

    public function show(Request $request, Course $course): CourseResource
    {
        Gate::authorize('view', $course);

        $course->load('module.formation')
            ->loadExists(['completedBy as is_completed' => fn ($query) => $query->whereKey($request->user()->id)]);

        return new CourseResource($course);
    }

    /**
     * Marque le cours comme terminé et renvoie la progression mise à jour de la formation.
     */
    public function complete(Request $request, Course $course): JsonResponse
    {
        Gate::authorize('view', $course);

        $this->progress->completeCourse($request->user(), $course);

        return response()->json([
            'message' => 'Cours marqué comme terminé.',
            'progress' => $this->progress->summary($request->user(), $course->module->formation),
        ], Response::HTTP_OK);
    }
}
