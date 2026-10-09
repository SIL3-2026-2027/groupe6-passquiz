<?php

namespace Database\Factories;

use App\Enums\FormationLevel;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Formation>
 */
class FormationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->words(2, true);

        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title),
            'code' => Str::upper(Str::substr(Str::slug($title, ''), 0, 3)),
            'description' => fake()->paragraph(),
            'level' => fake()->randomElement(FormationLevel::cases()),
            'is_published' => true,
        ];
    }

    /**
     * Indicate that the formation is not published.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }
}
