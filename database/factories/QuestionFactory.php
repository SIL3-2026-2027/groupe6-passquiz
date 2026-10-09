<?php

namespace Database\Factories;

use App\Enums\QuestionType;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'text' => fake()->sentence().' ?',
            'type' => QuestionType::Single,
            'points' => 1,
            'position' => fake()->numberBetween(1, 20),
        ];
    }

    /**
     * Indicate that the question accepts several correct answers.
     */
    public function multiple(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => QuestionType::Multiple,
        ]);
    }

    public function trueFalse(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => QuestionType::TrueFalse,
        ]);
    }
}
