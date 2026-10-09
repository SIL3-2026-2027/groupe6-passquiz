<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class StatisticsController extends Controller
{
    /**
     * Statistiques globales et détaillées par formation.
     */
    public function __invoke(): JsonResponse
    {
        $submitted = fn (Builder $attempts) => $attempts->whereNotNull('submitted_at');

        $formations = Formation::query()
            ->withCount([
                'enrollments',
                'enrollments as completed_enrollments_count' => fn (Builder $enrollments) => $enrollments->whereNotNull('completed_at'),
                'certificates as certificates_count' => fn (Builder $certificates) => $certificates->whereNull('revoked_at'),
                'attempts as attempts_count' => $submitted,
                'attempts as passed_attempts_count' => fn (Builder $attempts) => $attempts->where('passed', true),
            ])
            ->withAvg(['attempts as average_score' => $submitted], 'score')
            ->orderBy('title')
            ->get()
            ->map(fn (Formation $formation): array => [
                'id' => $formation->id,
                'title' => $formation->title,
                'enrollments' => $formation->enrollments_count,
                'completed_enrollments' => $formation->completed_enrollments_count,
                'certificates' => $formation->certificates_count,
                'attempts' => $formation->attempts_count,
                'passed_attempts' => $formation->passed_attempts_count,
                'average_score' => $formation->average_score !== null ? round((float) $formation->average_score, 1) : null,
                'success_rate' => $formation->attempts_count > 0
                    ? (int) round($formation->passed_attempts_count / $formation->attempts_count * 100)
                    : 0,
            ]);

        $attempts = QuizAttempt::query()->whereNotNull('submitted_at');
        $attemptsCount = (clone $attempts)->count();
        $passedCount = (clone $attempts)->where('passed', true)->count();

        return response()->json([
            'data' => [
                'global' => [
                    'attempts' => $attemptsCount,
                    'passed_attempts' => $passedCount,
                    'failed_attempts' => $attemptsCount - $passedCount,
                    'average_score' => $attemptsCount > 0 ? round((float) (clone $attempts)->avg('score'), 1) : null,
                    'success_rate' => $attemptsCount > 0 ? (int) round($passedCount / $attemptsCount * 100) : 0,
                ],
                'formations' => $formations,
            ],
        ]);
    }
}
