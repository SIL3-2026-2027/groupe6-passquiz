<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitQuizAttemptRequest;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\QuizAttemptResource;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class QuizAttemptController extends Controller
{
    public function __construct(private QuizService $quizzes) {}

    /**
     * Historique des tentatives de l'utilisateur (mes scores).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $attempts = $request->user()->quizAttempts()
            ->with('quiz.formation')
            ->latest('started_at')
            ->paginate($request->integer('per_page', 15));

        return QuizAttemptResource::collection($attempts);
    }

    /**
     * Démarre (ou reprend) une tentative et renvoie les questions, sans les bonnes réponses.
     */
    public function store(Request $request, Quiz $quiz): JsonResponse
    {
        Gate::authorize('view', $quiz);

        $attempt = $this->quizzes->start($request->user(), $quiz);

        return $this->inProgressResponse($attempt)
            ->setStatusCode($attempt->wasRecentlyCreated ? Response::HTTP_CREATED : Response::HTTP_OK);
    }

    /**
     * Tentative en cours : questions à répondre. Tentative soumise : résultat détaillé.
     */
    public function show(QuizAttempt $attempt): JsonResponse
    {
        Gate::authorize('view', $attempt);

        if (! $attempt->isSubmitted() && $this->quizzes->isExpired($attempt)) {
            $attempt = $this->quizzes->submit($attempt, []);
        }

        if (! $attempt->isSubmitted()) {
            return $this->inProgressResponse($attempt);
        }

        return (new QuizAttemptResource($attempt->load(['quiz.formation', 'answers', 'certificate'])))->response();
    }

    /**
     * Soumet les réponses : correction automatique, score et certificat si réussite.
     */
    public function submit(SubmitQuizAttemptRequest $request, QuizAttempt $attempt): QuizAttemptResource
    {
        Gate::authorize('view', $attempt);

        $attempt = $this->quizzes->submit($attempt, $request->responses());

        return new QuizAttemptResource($attempt->load(['quiz.formation', 'answers', 'certificate']));
    }

    private function inProgressResponse(QuizAttempt $attempt): JsonResponse
    {
        $attempt->load('quiz.formation');

        return (new QuizAttemptResource($attempt))->additional([
            'meta' => [
                'deadline' => $this->quizzes->deadline($attempt),
                'questions' => QuestionResource::collection($this->quizzes->questionsFor($attempt)),
            ],
        ])->response();
    }
}
