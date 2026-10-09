<?php

namespace App\Http\Resources;

use App\Models\AttemptAnswer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AttemptAnswer
 */
class AttemptAnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'question_id' => $this->question_id,
            'selected_answer_ids' => $this->selected_answer_ids,
            'is_correct' => $this->is_correct,
            'points_earned' => $this->points_earned,
            'question' => new QuestionResource($this->whenLoaded('question')),
        ];
    }
}
