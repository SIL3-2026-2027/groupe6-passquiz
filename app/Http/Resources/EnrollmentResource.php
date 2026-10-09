<?php

namespace App\Http\Resources;

use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Enrollment
 */
class EnrollmentResource extends JsonResource
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
            'formation_id' => $this->formation_id,
            'enrolled_at' => $this->created_at,
            'completed_at' => $this->completed_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'formation' => new FormationResource($this->whenLoaded('formation')),
        ];
    }
}
