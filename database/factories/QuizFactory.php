<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'formation_id' => Formation::factory(),
            'title' => 'Évaluation finale',
            'description' => fake()->sentence(),
            'passing_score' => 70,
            'time_limit_minutes' => null,
            'max_attempts' => null,
            'retry_delay_minutes' => null,
            'requires_course_completion' => false,
            'shuffle_questions' => false,
            'shuffle_answers' => false,
            'is_published' => true,
        ];
    }
}
