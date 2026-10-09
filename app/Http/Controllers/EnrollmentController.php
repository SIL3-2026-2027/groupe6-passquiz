<?php

namespace App\Http\Controllers;

use App\Http\Resources\EnrollmentResource;
use App\Models\Formation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EnrollmentController extends Controller
{
    /**
     * Inscription de l'utilisateur à une formation.
     */
    public function store(Request $request, Formation $formation): JsonResponse
    {
        abort_unless($formation->is_published, Response::HTTP_NOT_FOUND);

        $enrollment = $formation->enrollments()->firstOrCreate(['user_id' => $request->user()->id]);

        return (new EnrollmentResource($enrollment->load('formation')))
            ->response()
            ->setStatusCode($enrollment->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
    }
}
