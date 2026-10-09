<?php

namespace Tests\Feature\Admin;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shows_the_key_figures(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $popular = Formation::factory()->create();
        $quiz = Quiz::factory()->for($popular)->create();
        Enrollment::factory()->count(3)->for($popular)->create();
        Formation::factory()->create();
        QuizAttempt::factory()->for($quiz)->create(['score' => 80, 'passed' => true]);
        QuizAttempt::factory()->for($quiz)->create(['score' => 40, 'passed' => false]);
        Certificate::factory()->for($popular)->create();

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.counts.formations', 2)
            ->assertJsonPath('data.counts.quizzes', 1)
            ->assertJsonPath('data.counts.certificates', 1)
            ->assertJsonPath('data.popular_formations.0.id', $popular->id)
            ->assertJsonPath('data.popular_formations.0.enrollments_count', 3)
            ->assertJsonPath('data.success_rate.percent', 50)
            ->assertJsonCount(2, 'data.latest_attempts');
    }

    public function test_statistics_are_computed_per_formation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $quiz = Quiz::factory()->create();
        QuizAttempt::factory()->for($quiz)->create(['score' => 90, 'passed' => true]);
        QuizAttempt::factory()->for($quiz)->create(['score' => 50, 'passed' => false]);

        $this->getJson('/api/admin/statistics')
            ->assertOk()
            ->assertJsonPath('data.global.success_rate', 50)
            ->assertJsonPath('data.formations.0.attempts', 2)
            ->assertJsonPath('data.formations.0.passed_attempts', 1)
            ->assertJsonPath('data.formations.0.average_score', 70);
    }
}
