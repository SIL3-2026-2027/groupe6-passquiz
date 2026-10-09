<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\FormationResource;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\UserResource;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Formation;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Chiffres clés, derniers utilisateurs, dernières tentatives, formations populaires et taux de réussite.
     */
    public function __invoke(): JsonResponse
    {
        $submittedAttempts = QuizAttempt::query()->whereNotNull('submitted_at');
        $submittedCount = (clone $submittedAttempts)->count();
        $passedCount = (clone $submittedAttempts)->where('passed', true)->count();

        return response()->json([
            'data' => [
                'counts' => [
                    'users' => User::count(),
                    'learners' => User::where('role', UserRole::Learner)->count(),
                    'formations' => Formation::count(),
                    'courses' => Course::count(),
                    'quizzes' => Quiz::count(),
                    'certificates' => Certificate::whereNull('revoked_at')->count(),
                ],
                'latest_users' => UserResource::collection(User::latest()->limit(5)->get()),
                'latest_attempts' => QuizAttemptResource::collection(
                    QuizAttempt::with(['user', 'quiz.formation'])
                        ->whereNotNull('submitted_at')
                        ->latest('submitted_at')
                        ->limit(10)
                        ->get()
                ),
                'popular_formations' => FormationResource::collection(
                    Formation::withCount(['enrollments', 'certificates'])
                        ->orderByDesc('enrollments_count')
                        ->limit(5)
                        ->get()
                ),
                'success_rate' => [
                    'submitted_attempts' => $submittedCount,
                    'passed_attempts' => $passedCount,
                    'percent' => $submittedCount > 0 ? (int) round($passedCount / $submittedCount * 100) : 0,
                ],
            ],
        ]);
    }
}
