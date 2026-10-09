<?php

namespace App\Http\Resources;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Quiz
 */
class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'formation_id' => $this->formation_id,
            'title' => $this->title,
            'description' => $this->description,
            'passing_score' => $this->passing_score,
            'time_limit_minutes' => $this->time_limit_minutes,
            'max_attempts' => $this->max_attempts,
            'retry_delay_minutes' => $this->retry_delay_minutes,
            'requires_course_completion' => $this->requires_course_completion,
            'shuffle_questions' => $this->shuffle_questions,
            'shuffle_answers' => $this->shuffle_answers,
            'is_published' => $this->is_published,
            'questions_count' => $this->whenCounted('questions'),
            'total_points' => $this->whenAggregated('questions', 'points', 'sum', fn ($total) => (int) $total),
            'attempts_count' => $this->whenCounted('attempts'),
            'formation' => new FormationResource($this->whenLoaded('formation')),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
