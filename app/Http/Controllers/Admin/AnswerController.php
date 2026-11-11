<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnswerRequest;
use App\Http\Resources\AnswerResource;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class AnswerController extends Controller
{
    public function index(Question $question): AnonymousResourceCollection
    {
        Gate::authorize('manage', $question->quiz->formation);

        return AnswerResource::collection($question->answers);
    }

    /**
     * @throws ValidationException
     */
    public function store(AnswerRequest $request, Question $question): JsonResponse
    {
        Gate::authorize('manage', $question->quiz->formation);

        $this->ensureSingleCorrectAnswer($question, $request->boolean('is_correct'));

        $answer = $question->answers()->create($request->validated());

        return (new AnswerResource($answer))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @throws ValidationException
     */
    public function update(AnswerRequest $request, Answer $answer): AnswerResource
    {
        Gate::authorize('manage', $answer->question->quiz->formation);

        $this->ensureSingleCorrectAnswer($answer->question, $request->boolean('is_correct'), $answer);

        $answer->update($request->validated());

        return new AnswerResource($answer);
    }

    public function destroy(Answer $answer): Response
    {
        Gate::authorize('manage', $answer->question->quiz->formation);

        $answer->delete();

        return response()->noContent();
    }

    /**
     * Une question à choix unique ne peut avoir qu'une seule bonne réponse.
     *
     * @throws ValidationException
     */
    private function ensureSingleCorrectAnswer(Question $question, bool $isCorrect, ?Answer $ignore = null): void
    {
        if (! $isCorrect || $question->type !== QuestionType::Single) {
            return;
        }

        $hasOtherCorrectAnswer = $question->answers()
            ->where('is_correct', true)
            ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->id))
            ->exists();

        if ($hasOtherCorrectAnswer) {
            throw ValidationException::withMessages(['is_correct' => 'Cette question à choix unique possède déjà une bonne réponse.']);
        }
    }
}
