<?php

namespace Tests\Feature;

use App\Models\Formation;
use App\Models\User;
use Database\Seeders\FormationSeeder;
use Database\Seeders\LaravelFormationSeeder;
use Database\Seeders\ReactFormationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FormationContentSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_installs_the_react_formation_from_the_team_content(): void
    {
        Storage::fake('public');
        $trainer = User::factory()->trainer()->create();

        $this->seed(ReactFormationSeeder::class);
        $this->seed(ReactFormationSeeder::class);

        $formation = Formation::where('slug', 'react')->sole();

        $this->assertSame($trainer->id, $formation->trainer_id);
        $this->assertTrue($formation->is_published);
        $this->assertSame(range(1, 8), $formation->modules()->pluck('number')->all());
        $this->assertSame(31, $formation->courses()->count());
        $this->assertSame(8, $formation->modules()->has('quiz')->count());
        $this->assertSame(9, $formation->quizzes()->count());

        $finalQuiz = $formation->quiz()->withCount('questions')->sole();
        $this->assertSame(20, $finalQuiz->questions_count);
        $this->assertSame(70, $finalQuiz->passing_score);

        $moduleQuiz = $formation->modules()->first()->quiz()->withCount('questions')->sole();
        $this->assertSame(10, $moduleQuiz->questions_count);
        $this->assertSame(60, $moduleQuiz->passing_score);
        $this->assertSame(3, $moduleQuiz->max_attempts);
        $this->assertSame(1440, $moduleQuiz->retry_delay_minutes);

        $pdfPaths = $formation->courses()->whereNotNull('pdf_path')->pluck('pdf_path');
        $this->assertCount(8, $pdfPaths);
        $pdfPaths->each(fn (string $path) => Storage::disk('public')->assertExists($path));
        $this->assertCount(8, Storage::disk('public')->allFiles('courses'));
    }

    public function test_it_replaces_the_laravel_modules_and_the_provisional_final_evaluation(): void
    {
        Storage::fake('public');
        $trainer = User::factory()->trainer()->create();
        $learner = User::factory()->create();

        $this->seed(FormationSeeder::class);
        $formation = Formation::where('slug', 'laravel')->sole();
        $formation->enrollments()->create(['user_id' => $learner->id]);
        $finalQuizId = $formation->quiz->id;

        $this->seed(LaravelFormationSeeder::class);

        $formation->refresh();
        $this->assertSame($trainer->id, $formation->trainer_id);
        $this->assertSame(range(1, 12), $formation->modules()->pluck('number')->all());
        $this->assertSame('L\'autorisation : Gates et Policies', $formation->modules()->where('number', 12)->value('title'));
        $this->assertSame(39, $formation->courses()->count());
        $this->assertSame(12, $formation->modules()->has('quiz')->count());
        $this->assertSame(120, $formation->quizzes()->whereNotNull('module_id')->withCount('questions')->get()->sum('questions_count'));
        $this->assertSame(5, $formation->courses()->whereNotNull('pdf_path')->count());
        $this->assertCount(5, Storage::disk('public')->allFiles('courses'));

        $finalQuiz = $formation->quiz()->withCount('questions')->sole();
        $this->assertNotSame($finalQuizId, $finalQuiz->id);
        $this->assertSame('Évaluation finale Laravel', $finalQuiz->title);
        $this->assertSame(20, $finalQuiz->questions_count);
        $this->assertSame(70, $finalQuiz->passing_score);
        $this->assertTrue($finalQuiz->is_published);
        $this->assertSame(1, $formation->quizzes()->whereNull('module_id')->count());
        $this->assertTrue($learner->isEnrolledIn($formation));
    }
}
