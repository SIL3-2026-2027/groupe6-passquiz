<?php

namespace App\Http\Controllers;

use App\Http\Resources\CertificateResource;
use App\Http\Resources\FormationResource;
use App\Http\Resources\QuizAttemptResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Tableau de bord apprenant : formations et progression, certificats, dernières évaluations.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'user' => ['id' => $user->id, 'name' => $user->name],
                'formations' => FormationResource::collection($user->formations()->withProgressFor($user)->get()),
                'certificates' => CertificateResource::collection(
                    $user->certificates()->whereNull('revoked_at')->with('formation')->latest('issued_at')->get()
                ),
                'latest_attempts' => QuizAttemptResource::collection(
                    $user->quizAttempts()->whereNotNull('submitted_at')->with('quiz.formation')->latest('submitted_at')->limit(5)->get()
                ),
            ],
        ]);
    }
}
