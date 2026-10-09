<?php

namespace App\Http\Resources;

use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin QuizAttempt
 */
class QuizAttemptResource extends JsonResource
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
            'user_id' => $this->user_id,
            'quiz_id' => $this->quiz_id,
            'attempt_number' => $this->attempt_number,
            'score' => $this->score,
            'earned_points' => $this->earned_points,
            'total_points' => $this->total_points,
            'passing_score' => $this->passing_score,
            'passed' => $this->passed,
            'status' => match (true) {
                ! $this->isSubmitted() => 'in_progress',
                $this->passed => 'passed',
                default => 'failed',
            },
            'status_label' => match (true) {
                ! $this->isSubmitted() => 'En cours',
                $this->passed => 'Réussi',
                default => 'À reprendre',
            },
            'started_at' => $this->started_at,
            'submitted_at' => $this->submitted_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),
            'certificate' => new CertificateResource($this->whenLoaded('certificate')),
        ];
    }
}
