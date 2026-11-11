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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Chiffres clés, derniers utilisateurs, dernières tentatives, formations populaires,
     * formations en attente de validation et taux de réussite.
     * Pour un formateur, tout est limité à ses formations et aux apprenants qui y sont inscrits.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $managedFormations = fn (Builder $formations) => $formations->managedBy($user);

        $submittedAttempts = QuizAttempt::query()
            ->whereHas('quiz.formation', $managedFormations)
            ->whereNotNull('submitted_at');
        $submittedCount = (clone $submittedAttempts)->count();
        $passedCount = (clone $submittedAttempts)->where('passed', true)->count();

        $users = $user->isAdmin()
            ? User::query()
            : User::query()->whereHas('formations', $managedFormations);

        return response()->json([
            'data' => [
                'counts' => [
                    'users' => (clone $users)->count(),
                    'learners' => (clone $users)->where('role', UserRole::Learner)->count(),
                    'formations' => Formation::managedBy($user)->count(),
                    'courses' => Course::whereHas('module.formation', $managedFormations)->count(),
                    'quizzes' => Quiz::whereHas('formation', $managedFormations)->count(),
                    'certificates' => Certificate::whereHas('formation', $managedFormations)->whereNull('revoked_at')->count(),
                ],
                'latest_users' => UserResource::collection((clone $users)->latest()->limit(5)->get()),
                'latest_attempts' => QuizAttemptResource::collection(
                    (clone $submittedAttempts)
                        ->with(['user', 'quiz.formation'])
                        ->latest('submitted_at')
                        ->limit(10)
                        ->get()
                ),
                'popular_formations' => FormationResource::collection(
                    Formation::managedBy($user)
                        ->withCount(['enrollments', 'certificates'])
                        ->orderByDesc('enrollments_count')
                        ->limit(5)
                        ->get()
                ),
                'pending_formations' => FormationResource::collection(
                    Formation::managedBy($user)
                        ->with('trainer')
                        ->where('is_published', false)
                        ->latest()
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
