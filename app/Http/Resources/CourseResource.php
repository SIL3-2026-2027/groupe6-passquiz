<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Course
 */
class CourseResource extends JsonResource
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
            'module_id' => $this->module_id,
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'video_url' => $this->video_url,
            'pdf_url' => $this->pdf_path ? Storage::disk('public')->url($this->pdf_path) : null,
            'duration_minutes' => $this->duration_minutes,
            'position' => $this->position,
            'is_completed' => $this->whenHas('is_completed', fn () => (bool) $this->is_completed),
            'module' => new ModuleResource($this->whenLoaded('module')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
