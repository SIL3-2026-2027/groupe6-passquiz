<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuizAttemptResource;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuizAttemptController extends Controller
{
    /**
     * Résultats des évaluations (filtres : user_id, quiz_id, formation_id, status = passed|failed|in_progress).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $attempts = QuizAttempt::query()
            ->with(['user', 'quiz.formation'])
            ->when($request->filled('user_id'), fn (Builder $query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('quiz_id'), fn (Builder $query) => $query->where('quiz_id', $request->integer('quiz_id')))
            ->when($request->filled('formation_id'), fn (Builder $query) => $query->whereRelation('quiz', 'formation_id', $request->integer('formation_id')))
            ->when($request->string('status')->toString(), fn (Builder $query, string $status) => match ($status) {
                'passed' => $query->whereNotNull('submitted_at')->where('passed', true),
                'failed' => $query->whereNotNull('submitted_at')->where('passed', false),
                'in_progress' => $query->whereNull('submitted_at'),
                default => $query,
            })
            ->latest('started_at')
            ->paginate($request->integer('per_page', 15));

        return QuizAttemptResource::collection($attempts);
    }

    /**
     * Détail d'une tentative avec les réponses choisies et la correction.
     */
    public function show(QuizAttempt $attempt): QuizAttemptResource
    {
        return new QuizAttemptResource($attempt->load(['user', 'quiz.formation', 'answers.question.answers', 'certificate']));
    }

    /**
     * Supprime une tentative (permet par exemple d'accorder une tentative supplémentaire).
     */
    public function destroy(QuizAttempt $attempt): Response
    {
        $attempt->delete();

        return response()->noContent();
    }
}
