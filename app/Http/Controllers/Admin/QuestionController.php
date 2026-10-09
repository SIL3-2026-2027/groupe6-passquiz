<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index(Quiz $quiz): AnonymousResourceCollection
    {
        return QuestionResource::collection($quiz->questions()->with('answers')->get());
    }

    /**
     * Crée la question avec ses réponses.
     */
    public function store(QuestionRequest $request, Quiz $quiz): JsonResponse
    {
        $question = DB::transaction(function () use ($request, $quiz): Question {
            $question = $quiz->questions()->create($request->safe()->except('answers'));

            $this->syncAnswers($question, $request->validated('answers'));

            return $question;
        });

        return (new QuestionResource($question->load('answers')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Question $question): QuestionResource
    {
        return new QuestionResource($question->load('answers'));
    }

    /**
     * Met à jour la question ; si `answers` est fourni, les réponses sont synchronisées
     * (réponses avec `id` modifiées, sans `id` créées, absentes supprimées).
     */
    public function update(QuestionRequest $request, Question $question): QuestionResource
    {
        DB::transaction(function () use ($request, $question): void {
            $question->update($request->safe()->except('answers'));

            if ($request->has('answers')) {
                $this->syncAnswers($question, $request->validated('answers'));
            }
        });

        return new QuestionResource($question->load('answers'));
    }

    public function destroy(Question $question): Response
    {
        $question->delete();

        return response()->noContent();
    }

    /**
     * @param  array<int, array{id?: int|null, text: string, is_correct: bool}>  $answers
     */
    private function syncAnswers(Question $question, array $answers): void
    {
        $keptIds = [];

        foreach (array_values($answers) as $index => $answer) {
            $attributes = [
                'text' => $answer['text'],
                'is_correct' => (bool) $answer['is_correct'],
                'position' => $index + 1,
            ];

            $existing = isset($answer['id']) ? $question->answers()->find($answer['id']) : null;

            if ($existing !== null) {
                $existing->update($attributes);
                $keptIds[] = $existing->id;
            } else {
                $keptIds[] = $question->answers()->create($attributes)->id;
            }
        }

        $question->answers()->whereNotIn('id', $keptIds)->delete();
    }
}
