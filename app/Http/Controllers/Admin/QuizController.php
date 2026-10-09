<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuizController extends Controller
{
    /**
     * Liste des évaluations (filtre : formation_id).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $quizzes = Quiz::query()
            ->with('formation')
            ->withCount(['questions', 'attempts'])
            ->withSum('questions', 'points')
            ->when($request->filled('formation_id'), fn ($query) => $query->where('formation_id', $request->integer('formation_id')))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return QuizResource::collection($quizzes);
    }

    public function store(QuizRequest $request): JsonResponse
    {
        $quiz = Quiz::create($request->validated());

        return (new QuizResource($quiz->load('formation')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Quiz $quiz): QuizResource
    {
        $quiz->load(['formation', 'questions.answers'])
            ->loadCount(['questions', 'attempts'])
            ->loadSum('questions', 'points');

        return new QuizResource($quiz);
    }

    public function update(QuizRequest $request, Quiz $quiz): QuizResource
    {
        $quiz->update($request->validated());

        return new QuizResource($quiz->load('formation'));
    }

    public function destroy(Quiz $quiz): Response
    {
        $quiz->delete();

        return response()->noContent();
    }
}
