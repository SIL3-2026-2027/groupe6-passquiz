<?php

namespace App\Http\Resources;

use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Formation
 */
class FormationResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'code' => $this->code,
            'description' => $this->description,
            'level' => $this->level,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'is_published' => $this->is_published,
            'is_enrolled' => $this->whenHas('is_enrolled', fn () => (bool) $this->is_enrolled),
            'modules_count' => $this->whenCounted('modules'),
            'courses_count' => $this->whenCounted('courses'),
            'enrollments_count' => $this->whenCounted('enrollments'),
            'certificates_count' => $this->whenCounted('certificates'),
            'progress' => $this->whenHas('completed_courses_count', fn () => [
                'total_courses' => (int) $this->courses_count,
                'completed_courses' => (int) $this->completed_courses_count,
                'percent' => $this->progressPercent(),
            ]),
            'modules' => ModuleResource::collection($this->whenLoaded('modules')),
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
