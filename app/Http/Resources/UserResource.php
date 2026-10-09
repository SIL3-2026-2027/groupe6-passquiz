<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at,
            'enrollments_count' => $this->whenCounted('enrollments'),
            'certificates_count' => $this->whenCounted('certificates'),
            'quiz_attempts_count' => $this->whenCounted('quizAttempts'),
            'completed_courses_count' => $this->whenHas('completed_courses_count'),
            'enrollment' => $this->whenPivotLoaded('enrollments', fn () => [
                'enrolled_at' => $this->pivot->created_at,
                'completed_at' => $this->pivot->completed_at,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
