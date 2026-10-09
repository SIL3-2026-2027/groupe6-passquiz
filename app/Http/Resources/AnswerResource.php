<?php

namespace App\Http\Resources;

use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Answer
 */
class AnswerResource extends JsonResource
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
            'question_id' => $this->question_id,
            'text' => $this->text,
            'position' => $this->position,
            'is_correct' => $this->when($request->routeIs('admin.*'), $this->is_correct),
        ];
    }
}
