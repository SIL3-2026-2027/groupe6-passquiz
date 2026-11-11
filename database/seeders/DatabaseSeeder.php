<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Administrateur PassQuiz',
            'email' => 'admin@passquiz.com',
        ]);

        User::factory()->trainer()->create([
            'name' => 'Formateur PassQuiz',
            'email' => 'formateur@passquiz.com',
        ]);

        User::factory()->create([
            'name' => 'Camille Exemple',
            'email' => 'apprenant@passquiz.com',
        ]);

        $this->call([FormationSeeder::class, LaravelFormationSeeder::class, ReactFormationSeeder::class]);
    }
}
