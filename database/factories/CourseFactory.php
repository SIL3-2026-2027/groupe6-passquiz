<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'video_url' => null,
            'duration_minutes' => fake()->numberBetween(5, 60),
            'position' => fake()->numberBetween(1, 10),
        ];
    }
}
