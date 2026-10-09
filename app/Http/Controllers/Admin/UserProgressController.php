<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificateResource;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\UserResource;
use App\Models\Formation;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserProgressController extends Controller
{
    /**
     * Progression d'un apprenant : avancement par formation, tentatives et certificats.
     */
    public function __invoke(User $user): JsonResponse
    {
        $formations = $user->formations()->withProgressFor($user)->with('quiz')->get();

        $attemptsByQuiz = $user->quizAttempts()
            ->whereNotNull('submitted_at')
            ->get()
            ->groupBy('quiz_id');

        $certificatesByFormation = $user->certificates()->get()->keyBy('formation_id');

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'formations' => $formations->map(function (Formation $formation) use ($attemptsByQuiz, $certificatesByFormation): array {
                    $attempts = $attemptsByQuiz->get($formation->quiz?->id, collect());
                    $certificate = $certificatesByFormation->get($formation->id);

                    return [
                        'id' => $formation->id,
                        'title' => $formation->title,
                        'enrolled_at' => $formation->pivot->created_at,
                        'completed_at' => $formation->pivot->completed_at,
                        'progress' => [
                            'total_courses' => (int) $formation->courses_count,
                            'completed_courses' => (int) $formation->completed_courses_count,
                            'percent' => $formation->progressPercent(),
                        ],
                        'quiz' => [
                            'attempts_count' => $attempts->count(),
                            'best_score' => $attempts->max('score'),
                            'passed' => $attempts->contains(fn (QuizAttempt $attempt): bool => $attempt->passed),
                            'last_attempt' => $attempts->isNotEmpty()
                                ? new QuizAttemptResource($attempts->sortByDesc('submitted_at')->first())
                                : null,
                        ],
                        'certificate' => $certificate ? new CertificateResource($certificate) : null,
                    ];
                }),
            ],
        ]);
    }
}
