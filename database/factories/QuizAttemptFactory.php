<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $score = fake()->numberBetween(0, 100);

        return [
            'user_id' => User::factory(),
            'quiz_id' => Quiz::factory(),
            'attempt_number' => 1,
            'score' => $score,
            'earned_points' => $score,
            'total_points' => 100,
            'passing_score' => 70,
            'passed' => $score >= 70,
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now(),
        ];
    }

    /**
     * Indicate that the attempt is still in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'score' => null,
            'earned_points' => null,
            'total_points' => null,
            'passed' => null,
            'started_at' => now(),
            'submitted_at' => null,
        ]);
    }
}
