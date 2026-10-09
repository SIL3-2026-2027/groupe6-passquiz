<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Module>
 */
class ModuleFactory extends Factory
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
            'number' => fake()->unique()->numberBetween(1, 10000),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
        ];
    }
}
