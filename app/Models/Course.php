<?php

namespace App\Models;

use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['module_id', 'title', 'description', 'content', 'video_url', 'pdf_path', 'duration_minutes', 'position'])]
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Module, $this>
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function completedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_progress')
            ->withPivot('completed_at')
            ->withTimestamps();
    }
}
