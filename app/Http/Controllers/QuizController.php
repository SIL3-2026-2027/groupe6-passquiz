<?php

namespace App\Http\Controllers;

use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\ProgressService;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QuizController extends Controller
{
    public function __construct(
        private QuizService $quizzes,
        private ProgressService $progress,
    ) {}

    /**
     * Informations de l'évaluation et historique des tentatives de l'utilisateur (sans les questions).
     */
    public function show(Request $request, Quiz $quiz): JsonResponse
    {
        Gate::authorize('view', $quiz);

        $quiz->load('formation')->loadCount('questions')->loadSum('questions', 'points');

        $user = $request->user();
        $attempts = $quiz->attempts()->whereBelongsTo($user)->latest('started_at')->get();
        $remainingAttempts = $quiz->max_attempts !== null ? max(0, $quiz->max_attempts - $attempts->count()) : null;
        $blockingReason = $this->quizzes->blockingReason($user, $quiz, $attempts);

        return (new QuizResource($quiz))->additional([
            'meta' => [
                'is_enrolled' => $user->isEnrolledIn($quiz->formation),
                'progress' => $this->progress->summary($user, $quiz->formation),
                'has_passed' => $attempts->contains(fn (QuizAttempt $attempt): bool => (bool) $attempt->passed),
                'best_score' => $attempts->max('score'),
                'remaining_attempts' => $remainingAttempts,
                'next_attempt_at' => $this->quizzes->nextAttemptAt($quiz, $attempts),
                'can_attempt' => $blockingReason === null,
                'blocking_reason' => $blockingReason,
                'attempts' => QuizAttemptResource::collection($attempts),
            ],
        ])->response();
    }
}
