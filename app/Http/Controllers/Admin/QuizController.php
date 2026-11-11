<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Formation;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class QuizController extends Controller
{
    /**
     * Liste des évaluations des formations gérées par l'utilisateur (filtre : formation_id).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $quizzes = Quiz::query()
            ->whereHas('formation', fn (Builder $formations) => $formations->managedBy($request->user()))
            ->with(['formation', 'module'])
            ->withCount(['questions', 'attempts'])
            ->withSum('questions', 'points')
            ->when($request->filled('formation_id'), fn ($query) => $query->where('formation_id', $request->integer('formation_id')))
            ->orderBy('formation_id')
            ->orderByRaw('module_id is null')
            ->orderBy('module_id')
            ->paginate($request->integer('per_page', 15));

        return QuizResource::collection($quizzes);
    }

    public function store(QuizRequest $request): JsonResponse
    {
        Gate::authorize('manage', Formation::findOrFail($request->integer('formation_id')));

        $quiz = Quiz::create($request->validated());

        return (new QuizResource($quiz->load(['formation', 'module'])))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Quiz $quiz): QuizResource
    {
        Gate::authorize('manage', $quiz->formation);

        $quiz->load(['formation', 'module', 'questions.answers'])
            ->loadCount(['questions', 'attempts'])
            ->loadSum('questions', 'points');

        return new QuizResource($quiz);
    }

    public function update(QuizRequest $request, Quiz $quiz): QuizResource
    {
        Gate::authorize('manage', $quiz->formation);
        Gate::authorize('manage', Formation::findOrFail($request->integer('formation_id')));

        $quiz->update($request->validated());

        return new QuizResource($quiz->load(['formation', 'module']));
    }

    public function destroy(Quiz $quiz): Response
    {
        Gate::authorize('manage', $quiz->formation);

        $quiz->delete();

        return response()->noContent();
    }
}
