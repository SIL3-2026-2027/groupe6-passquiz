<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'formation_id' => Formation::factory(),
            'score' => fake()->numberBetween(70, 100),
            'issued_at' => now(),
        ];
    }

    /**
     * Indicate that the certificate has been revoked.
     */
    public function revoked(): static
    {
        return $this->state(fn (array $attributes) => [
            'revoked_at' => now(),
            'revocation_reason' => 'Fraude constatée',
        ]);
    }
}
