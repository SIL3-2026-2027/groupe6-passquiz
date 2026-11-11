<?php

namespace Tests\Feature\Admin;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TrainerAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $trainer;

    private Formation $ownFormation;

    private Formation $otherFormation;

    protected function setUp(): void
    {
        parent::setUp();

        $this->trainer = User::factory()->trainer()->create();
        $this->ownFormation = Formation::factory()->for($this->trainer, 'trainer')->create();
        $this->otherFormation = Formation::factory()->for(User::factory()->trainer(), 'trainer')->create();

        Sanctum::actingAs($this->trainer);
    }

    public function test_a_formation_created_by_a_trainer_belongs_to_them_and_stays_a_draft(): void
    {
        $response = $this->postJson('/api/admin/formations', [
            'title' => 'Symfony',
            'code' => 'SYM',
            'level' => 'beginner',
            'is_published' => true,
            'trainer_id' => $this->otherFormation->trainer_id,
        ])->assertCreated();

        $this->assertDatabaseHas('formations', [
            'id' => $response->json('data.id'),
            'trainer_id' => $this->trainer->id,
            'is_published' => false,
        ]);
    }

    public function test_trainers_only_see_their_own_formations(): void
    {
        $this->getJson('/api/admin/formations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->ownFormation->id);

        $this->getJson("/api/admin/formations/{$this->ownFormation->id}")->assertOk();
        $this->getJson("/api/admin/formations/{$this->otherFormation->id}")->assertForbidden();
    }

    public function test_trainers_cannot_modify_the_formations_of_other_trainers(): void
    {
        $module = Module::factory()->for($this->otherFormation)->create();
        $course = Course::factory()->for($module)->create();

        $this->putJson("/api/admin/formations/{$this->otherFormation->id}", ['title' => 'Piraté', 'level' => 'beginner'])->assertForbidden();
        $this->deleteJson("/api/admin/formations/{$this->otherFormation->id}")->assertForbidden();
        $this->postJson("/api/admin/formations/{$this->otherFormation->id}/modules", ['number' => 99, 'title' => 'Module'])->assertForbidden();
        $this->putJson("/api/admin/modules/{$module->id}", ['number' => $module->number, 'title' => 'Piraté'])->assertForbidden();
        $this->postJson("/api/admin/modules/{$module->id}/courses", ['title' => 'Cours', 'content' => 'Contenu', 'position' => 1])->assertForbidden();
        $this->deleteJson("/api/admin/courses/{$course->id}")->assertForbidden();

        $this->assertModelExists($this->otherFormation);
        $this->assertModelExists($course);
    }

    public function test_trainers_manage_the_content_of_their_own_formations(): void
    {
        $this->postJson("/api/admin/formations/{$this->ownFormation->id}/modules", ['number' => 1, 'title' => 'Introduction'])->assertCreated();
        $module = $this->ownFormation->modules()->first();

        $this->postJson("/api/admin/modules/{$module->id}/courses", [
            'title' => 'Premier cours',
            'content' => 'Contenu du cours',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'position' => 1,
        ])->assertCreated();

        $this->putJson("/api/admin/formations/{$this->ownFormation->id}", [
            'title' => 'Titre modifié',
            'level' => 'advanced',
        ])->assertOk();

        $this->assertDatabaseHas('formations', ['id' => $this->ownFormation->id, 'title' => 'Titre modifié']);
    }

    public function test_trainers_define_the_quiz_of_their_own_formations_only(): void
    {
        $quiz = [
            'title' => 'Évaluation finale',
            'passing_score' => 70,
            'time_limit_minutes' => 20,
            'max_attempts' => 3,
            'retry_delay_minutes' => 1440,
        ];

        $this->postJson('/api/admin/quizzes', [...$quiz, 'formation_id' => $this->otherFormation->id])->assertForbidden();
        $this->postJson('/api/admin/quizzes', [...$quiz, 'formation_id' => $this->ownFormation->id])->assertCreated();

        $otherQuiz = Quiz::factory()->for($this->otherFormation)->create();

        $this->getJson('/api/admin/quizzes')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/admin/quizzes/{$otherQuiz->id}")->assertForbidden();
        $this->postJson("/api/admin/quizzes/{$otherQuiz->id}/questions", [
            'text' => 'Question ?',
            'type' => 'single',
            'points' => 1,
            'position' => 1,
            'answers' => [['text' => 'Oui', 'is_correct' => true], ['text' => 'Non', 'is_correct' => false]],
        ])->assertForbidden();
    }

    public function test_trainers_only_see_the_results_and_progress_of_their_learners(): void
    {
        $ownLearner = User::factory()->create();
        $otherLearner = User::factory()->create();
        Enrollment::factory()->for($ownLearner)->for($this->ownFormation)->create();
        Enrollment::factory()->for($otherLearner)->for($this->otherFormation)->create();

        $ownAttempt = QuizAttempt::factory()->for($ownLearner)->for(Quiz::factory()->for($this->ownFormation))->create();
        $otherAttempt = QuizAttempt::factory()->for($otherLearner)->for(Quiz::factory()->for($this->otherFormation))->create();

        $this->getJson('/api/admin/attempts')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownAttempt->id);
        $this->getJson("/api/admin/attempts/{$ownAttempt->id}")->assertOk();
        $this->getJson("/api/admin/attempts/{$otherAttempt->id}")->assertForbidden();

        $this->getJson("/api/admin/formations/{$this->ownFormation->id}/learners")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/admin/formations/{$this->otherFormation->id}/learners")->assertForbidden();

        $this->getJson("/api/admin/users/{$ownLearner->id}/progress")
            ->assertOk()
            ->assertJsonCount(1, 'data.formations');
        $this->getJson("/api/admin/users/{$otherLearner->id}/progress")->assertForbidden();
    }

    public function test_the_trainer_dashboard_only_counts_their_formations(): void
    {
        Enrollment::factory()->for($this->ownFormation)->create();
        Enrollment::factory()->count(2)->for($this->otherFormation)->create();
        QuizAttempt::factory()->for(Quiz::factory()->for($this->ownFormation))->create(['score' => 80, 'passed' => true]);
        QuizAttempt::factory()->for(Quiz::factory()->for($this->otherFormation))->create(['score' => 10, 'passed' => false]);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.counts.formations', 1)
            ->assertJsonPath('data.counts.users', 1)
            ->assertJsonPath('data.counts.quizzes', 1)
            ->assertJsonPath('data.success_rate.percent', 100)
            ->assertJsonCount(1, 'data.popular_formations');

        $this->getJson('/api/admin/statistics')
            ->assertOk()
            ->assertJsonCount(1, 'data.formations')
            ->assertJsonPath('data.global.attempts', 1);
    }

    public function test_only_administrators_publish_formations(): void
    {
        $this->putJson("/api/admin/formations/{$this->ownFormation->id}/publication", ['is_published' => true])->assertForbidden();
        $this->putJson("/api/admin/formations/{$this->ownFormation->id}", [
            'title' => $this->ownFormation->title,
            'level' => 'beginner',
            'is_published' => false,
        ])->assertOk();
        $this->assertTrue($this->ownFormation->fresh()->is_published);

        $draft = Formation::factory()->unpublished()->for($this->trainer, 'trainer')->create();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/admin/formations/{$draft->id}/publication", ['is_published' => true])
            ->assertOk()
            ->assertJsonPath('data.is_published', true);
        $this->assertTrue($draft->fresh()->is_published);
    }

    public function test_administrators_assign_a_formation_to_a_trainer(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/admin/formations/{$this->otherFormation->id}", [
            'title' => $this->otherFormation->title,
            'level' => 'beginner',
            'trainer_id' => $this->trainer->id,
        ])->assertOk()->assertJsonPath('data.trainer.id', $this->trainer->id);

        $this->putJson("/api/admin/formations/{$this->otherFormation->id}", [
            'title' => $this->otherFormation->title,
            'level' => 'beginner',
            'trainer_id' => User::factory()->create()->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('trainer_id');

        $this->getJson('/api/admin/formations')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_trainers_cannot_manage_users_or_certificates(): void
    {
        $certificate = Certificate::factory()->create();
        $attempt = QuizAttempt::factory()->for(Quiz::factory()->for($this->ownFormation))->create();

        $this->getJson('/api/admin/users')->assertForbidden();
        $this->getJson('/api/admin/certificates')->assertForbidden();
        $this->postJson("/api/admin/certificates/{$certificate->id}/revoke", ['reason' => 'Test'])->assertForbidden();
        $this->deleteJson("/api/admin/attempts/{$attempt->id}")->assertForbidden();
    }
}
